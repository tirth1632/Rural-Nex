from rest_framework import serializers

class CalculateRequestSerializer(serializers.Serializer):
    available_margin = serializers.DecimalField(max_digits=12, decimal_places=2, required=True)
    desired_project_cost = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)

class EMIRequestSerializer(serializers.Serializer):
    principal = serializers.DecimalField(max_digits=12, decimal_places=2, required=True)
    interest_rate = serializers.DecimalField(max_digits=5, decimal_places=2, required=True)
    tenure_months = serializers.IntegerField(required=True)

class RepaymentRequestSerializer(EMIRequestSerializer):
    moratorium_months = serializers.IntegerField(required=True)

class WorkingCapitalRequestSerializer(serializers.Serializer):
    projected_annual_turnover = serializers.DecimalField(max_digits=14, decimal_places=2, required=True)
    margin_percentage = serializers.DecimalField(max_digits=3, decimal_places=2, required=False, default='0.20')
