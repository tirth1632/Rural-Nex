import os
import requests
import logging

logger = logging.getLogger(__name__)

def send_sms_otp(phone_number: str, otp_code: str) -> dict:
    """
    Sends a 6-digit OTP SMS to the target phone number using configured SMS Provider APIs.
    Supports Twilio Verify API (official SMS OTP delivery), Fast2SMS, and MSG91.
    """
    clean_phone = phone_number.replace(" ", "").replace("-", "")
    to_phone = clean_phone if clean_phone.startswith("+") else f"+91{clean_phone}"
    message = f"Your RuralNex verification OTP code is: {otp_code}. Valid for 5 minutes."

    twilio_sid = os.environ.get("TWILIO_ACCOUNT_SID")
    twilio_auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
    twilio_service_sid = os.environ.get("TWILIO_VERIFY_SERVICE_SID")
    twilio_phone = os.environ.get("TWILIO_PHONE_NUMBER")

    # 1. Twilio Verify API (Sends real 6-digit OTP directly to cell phone)
    if twilio_sid and twilio_auth_token and twilio_service_sid:
        try:
            url = f"https://verify.twilio.com/v2/Services/{twilio_service_sid}/Verifications"
            res = requests.post(
                url,
                data={"To": to_phone, "Channel": "sms"},
                auth=(twilio_sid, twilio_auth_token),
                timeout=10
            )
            if res.ok:
                return {"success": True, "provider": "Twilio Verify", "details": "SMS OTP sent via Twilio Verify."}
            else:
                logger.error(f"Twilio Verify error: {res.text}")
                # Fallback to standard Twilio SMS if Verify API fails
        except Exception as e:
            logger.error(f"Twilio Verify exception: {e}")

    # Standard Twilio Programmable SMS Fallback
    if twilio_sid and twilio_auth_token and twilio_phone:
        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Messages.json"
            res = requests.post(
                url,
                data={"From": twilio_phone, "To": to_phone, "Body": message},
                auth=(twilio_sid, twilio_auth_token),
                timeout=10
            )
            if res.ok:
                return {"success": True, "provider": "Twilio SMS", "details": "SMS sent via Twilio SMS."}
            else:
                logger.error(f"Twilio error: {res.text}")
        except Exception as e:
            logger.error(f"Twilio exception: {e}")


def check_twilio_verify_otp(phone_number: str, code: str) -> dict:
    twilio_sid = os.environ.get("TWILIO_ACCOUNT_SID")
    twilio_auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
    twilio_service_sid = os.environ.get("TWILIO_VERIFY_SERVICE_SID")

    if twilio_sid and twilio_auth_token and twilio_service_sid:
        clean_phone = phone_number.replace(" ", "").replace("-", "")
        to_phone = clean_phone if clean_phone.startswith("+") else f"+91{clean_phone}"
        try:
            url = f"https://verify.twilio.com/v2/Services/{twilio_service_sid}/VerificationCheck"
            res = requests.post(
                url,
                data={"To": to_phone, "Code": code},
                auth=(twilio_sid, twilio_auth_token),
                timeout=10
            )
            data = res.json()
            if res.ok and data.get("status") == "approved" and data.get("valid"):
                return {"success": True, "approved": True}
            else:
                return {"success": False, "approved": False, "error": data.get("message", "Invalid code")}
        except Exception as e:
            return {"success": False, "approved": False, "error": str(e)}

    return {"success": False, "approved": False, "error": "Twilio Verify not configured"}

    # 2. Check Fast2SMS Credentials (Popular in India)
    fast2sms_key = os.environ.get("FAST2SMS_API_KEY")
    if fast2sms_key:
        try:
            # Fast2SMS Quick OTP API
            target_number = clean_phone.replace("+91", "")
            url = "https://www.fast2sms.com/dev/bulkV2"
            headers = {"authorization": fast2sms_key}
            payload = {
                "variables_values": otp_code,
                "route": "otp",
                "numbers": target_number,
            }
            res = requests.post(url, data=payload, headers=headers, timeout=10)
            data = res.json()
            if data.get("return"):
                return {"success": True, "provider": "Fast2SMS", "details": "SMS sent successfully via Fast2SMS."}
            else:
                return {"success": False, "error": data.get("message", "Fast2SMS error")}
        except Exception as e:
            logger.error(f"Fast2SMS exception: {e}")
            return {"success": False, "error": str(e)}

    # 3. Check MSG91 Credentials (Popular in India)
    msg91_key = os.environ.get("MSG91_AUTH_KEY")
    msg91_flow_id = os.environ.get("MSG91_FLOW_ID")
    if msg91_key and msg91_flow_id:
        try:
            target_number = clean_phone.replace("+", "")
            url = "https://control.msg91.com/api/v5/otp"
            headers = {"authkey": msg91_key, "content-type": "application/json"}
            payload = {
                "template_id": msg91_flow_id,
                "mobile": target_number,
                "otp": otp_code,
            }
            res = requests.post(url, json=payload, headers=headers, timeout=10)
            data = res.json()
            if data.get("type") == "success":
                return {"success": True, "provider": "MSG91", "details": "SMS sent successfully via MSG91."}
            else:
                return {"success": False, "error": data.get("message", "MSG91 error")}
        except Exception as e:
            logger.error(f"MSG91 exception: {e}")
            return {"success": False, "error": str(e)}

    # 4. Fallback: Log to server console & return success in development mode
    print(f"\n==========================================")
    print(f"[DEVELOPMENT SMS GATEWAY] Target Phone: {clean_phone}")
    print(f"[DEVELOPMENT SMS GATEWAY] Message: {message}")
    print(f"==========================================\n")
    return {
        "success": True,
        "provider": "Console Demo",
        "details": "No SMS provider API key set in backend/.env. Simulated SMS delivery."
    }
