import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from geo.models import State, District

data = """
1. Andhra Pradesh — 28
Alluri Sitharama Raju, Anakapalli, Ananthapuramu, Annamayya, Bapatla, Chittoor, Dr. B.R. Ambedkar Konaseema, East Godavari, Eluru, Guntur, Kakinada, Krishna, Kurnool, Markapuram, Nandyal, Ntr, Palnadu, Parvathipuram Manyam, Polavaram, Prakasam, Sri Potti Sriramulu Nellore, Sri Sathya Sai, Srikakulam, Tirupati, Visakhapatnam, Vizianagaram, West Godavari, Y.S.R.

2. Arunachal Pradesh — 27
Anjaw, Bichom, Changlang, Dibang Valley, East Kameng, East Siang, Kamle, Keyi Panyor, Kra Daadi, Kurung Kumey, Leparada, Lohit, Longding, Lower Dibang Valley, Lower Siang, Lower Subansiri, Namsai, Pakke Kessang, Papum Pare, Shi Yomi, Siang, Tawang, Tirap, Upper Siang, Upper Subansiri, West Kameng, West Siang.

3. Assam — 35
Bajali, Baksa, Barpeta, Biswanath, Bongaigaon, Cachar, Charaideo, Chirang, Darrang, Dhemaji, Dhubri, Dibrugarh, Dima Hasao, Goalpara, Golaghat, Hailakandi, Hojai, Jorhat, Kamrup, Kamrup Metro, Karbi Anglong, Kokrajhar, Lakhimpur, Majuli, Marigaon, Nagaon, Nalbari, Sivasagar, Sonitpur, South Salmara-Mankachar, Tamulpur, Tinsukia, Udalguri, West Karbi Anglong, Sribhumi.

4. Bihar — 38
Araria, Arwal, Aurangabad, Banka, Begusarai, Bhagalpur, Bhojpur, Buxar, Darbhanga, Gaya, Gopalganj, Jamui, Jehanabad, Kaimur (Bhabua), Katihar, Khagaria, Kishanganj, Lakhisarai, Madhepura, Madhubani, Munger, Muzaffarpur, Nalanda, Nawada, Pashchim Champaran, Patna, Purba Champaran, Purnia, Rohtas, Saharsa, Samastipur, Saran, Sheikhpura, Sheohar, Sitamarhi, Siwan, Supaul, Vaishali.

5. Chhattisgarh — 33
Balod, Balodabazar-Bhatapara, Balrampur-Ramanujganj, Bastar, Bemetara, Bijapur, Bilaspur, Dakshin Bastar Dantewada, Dhamtari, Durg, Gariyaband, Gaurela-Pendra-Marwahi, Jangir-Champa, Jashpur, Kabeerdham, Kanker, Khairagarh-Chhuikhadan-Gandai, Kondagaon, Korba, Korea, Mahasamund, Manendragarh-Chirmiri-Bharatpur, Mohla-Manpur-Ambagarh Chowki, Mungeli, Narayanpur, Raigarh, Raipur, Rajnandgaon, Sakti, Sarangarh-Bilaigarh, Surajpur, Surguja, Sukma.

6. Goa — 3
Kushavati, North Goa, South Goa.

7. Gujarat — 34
Ahmedabad, Amreli, Anand, Arvalli, Banas Kantha, Bharuch, Bhavnagar, Botad, Chhotaudepur, Dahod, Dangs, Devbhumi Dwarka, Gandhinagar, Gir Somnath, Jamnagar, Junagadh, Kachchh, Kheda, Mahesana, Mahisagar, Morbi, Narmada, Navsari, Panch Mahals, Patan, Porbandar, Rajkot, Sabarkantha, Surat, Surendranagar, Tapi, Vadodara, Valsad, Vav-Tharad.

8. Haryana — 23
Ambala, Bhiwani, Charkhi Dadri, Faridabad, Fatehabad, Gurugram, Hansi, Hisar, Jhajjar, Jind, Kaithal, Karnal, Kurukshetra, Mahendragarh, Nuh, Palwal, Panchkula, Panipat, Rewari, Rohtak, Sirsa, Sonipat, Yamunanagar.

9. Himachal Pradesh — 12
Bilaspur, Chamba, Hamirpur, Kangra, Kinnaur, Kullu, Lahaul And Spiti, Mandi, Shimla, Sirmaur, Solan, Una.

10. Jharkhand — 24
Bokaro, Chatra, Deoghar, Dhanbad, Dumka, East Singhbum, Garhwa, Giridih, Godda, Gumla, Hazaribagh, Jamtara, Khunti, Koderma, Latehar, Lohardaga, Pakur, Palamu, Ramgarh, Ranchi, Sahebganj, Saraikela Kharsawan, Simdega, West Singhbhum.

11. Karnataka — 31
Bagalkote, Ballari, Belagavi, Bengaluru Rural, Bengaluru South, Bengaluru Urban, Bidar, Chamarajanagar, Chikkaballapura, Chikkamagaluru, Chitradurga, Dakshina Kannada, Davanagere, Dharwad, Gadag, Hassan, Haveri, Kalaburagi, Kodagu, Kolar, Koppal, Mandya, Mysuru, Raichur, Ramanagara, Shivamogga, Tumakuru, Udupi, Uttara Kannada, Vijayanagara, Vijayapura.

12. Kerala — 14
Alappuzha, Ernakulam, Idukki, Kannur, Kasaragod, Kollam, Kottayam, Kozhikode, Malappuram, Palakkad, Pathanamthitta, Thiruvananthapuram, Thrissur, Wayanad.

13. Madhya Pradesh — 55
Agar-Malwa, Alirajpur, Anuppur, Ashoknagar, Balaghat, Barwani, Betul, Bhind, Bhopal, Burhanpur, Chhatarpur, Chhindwara, Damoh, Datia, Dewas, Dhar, Dindori, Guna, Gwalior, Harda, Indore, Jabalpur, Jhabua, Katni, Khandwa, Khargone, Maihar, Mandla, Mandsaur, Mauganj, Morena, Narmadapuram, Narsinghpur, Neemuch, Niwari, Panna, Raisen, Rajgarh, Ratlam, Rewa, Sagar, Satna, Sehore, Seoni, Shahdol, Shajapur, Sheopur, Shivpuri, Sidhi, Singrauli, Tikamgarh, Ujjain, Umaria, Vidisha, Pandhurna.

14. Maharashtra — 36
Ahilyanagar, Akola, Amravati, Beed, Bhandara, Buldhana, Chandrapur, Chhatrapati Sambhajinagar, Dharashiv, Dhule, Gadchiroli, Gondia, Hingoli, Jalgaon, Jalna, Kolhapur, Latur, Mumbai, Mumbai Suburban, Nagpur, Nanded, Nandurbar, Nashik, Palghar, Parbhani, Pune, Raigad, Ratnagiri, Sangli, Satara, Sindhudurg, Solapur, Thane, Wardha, Washim, Yavatmal.

15. Manipur — 16
Bishnupur, Chandel, Churachandpur, Imphal East, Imphal West, Jiribam, Kakching, Kamjong, Kangpokpi, Noney, Pherzawl, Senapati, Tamenglong, Tengnoupal, Thoubal, Ukhrul.

16. Meghalaya — 12
East Garo Hills, East Jaintia Hills, East Khasi Hills, Eastern West Khasi Hills, North Garo Hills, Ri Bhoi, South Garo Hills, South West Garo Hills, South West Khasi Hills, West Garo Hills, West Jaintia Hills, West Khasi Hills.

17. Mizoram — 11
Aizawl, Champhai, Hnahthial, Khawzawl, Kolasib, Lawngtlai, Lunglei, Mamit, Saitual, Serchhip, Siaha.

18. Nagaland — 17
Chumoukedima, Dimapur, Kiphire, Kohima, Longleng, Meluri, Mokokchung, Mon, Niuland, Noklak, Peren, Phek, Shamator, Tseminyu, Tuensang, Wokha, Zunheboto.

19. Odisha — 30
Anugola, Balangir, Baleshwar, Baragada, Bhadrak, Boudh, Debagada, Dhenkanal, Gajapati, Ganjam, Jagatsinghapur, Jajpur, Jharsuguda, Kalahandi, Kandhamala, Kataka, Kendrapada, Kendujhar, Khordha, Koraput, Malkangiri, Mayurbhanj, Nabarangpur, Nayagada, Nuapada, Puri, Rayagada, Sambalpur, Subarnapur, Sundargarh.

20. Punjab — 23
Amritsar, Barnala, Bathinda, Faridkot, Fatehgarh Sahib, Fazilka, Ferozepur, Gurdaspur, Hoshiarpur, Jalandhar, Kapurthala, Ludhiana, Malerkotla, Mansa, Moga, Pathankot, Patiala, Rupnagar, S.A.S Nagar, Sangrur, Shahid Bhagat Singh Nagar, Sri Muktsar Sahib, Tarn Taran.

21. Rajasthan — 41
Ajmer, Alwar, Balotra, Banswara, Baran, Barmer, Beawar, Bharatpur, Bhilwara, Bikaner, Bundi, Chittorgarh, Churu, Dausa, Deeg, Dholpur, Didwana-Kuchaman, Dungarpur, Ganganagar, Hanumangarh, Jaipur, Jaisalmer, Jalore, Jhalawar, Jhunjhunu, Jodhpur, Karauli, Kekri, Kota, Kotputli-Behror, Nagaur, Pali, Pratapgarh, Rajsamand, Salumbar, Sawai Madhopur, Sikar, Sirohi, Tonk, Udaipur, Jodhpur Rural.

22. Sikkim — 6
Gangtok, Gyalshing, Mangan, Namchi, Pakyong, Soreng.

23. Tamil Nadu — 38
Ariyalur, Chengalpattu, Chennai, Coimbatore, Cuddalore, Dharmapuri, Dindigul, Erode, Kallakurichi, Kancheepuram, Kanniyakumari, Karur, Krishnagiri, Madurai, Mayiladuthurai, Nagapattinam, Namakkal, Perambalur, Pudukkottai, Ramanathapuram, Ranipet, Salem, Sivaganga, Tenkasi, Thanjavur, The Nilgiris, Theni, Thoothukudi, Tiruchirappalli, Tirunelveli, Tirupathur, Tiruppur, Tiruvallur, Tiruvannamalai, Tiruvarur, Vellore, Viluppuram, Virudhunagar.

24. Telangana — 33
Adilabad, Bhadradri Kothagudem, Hanumakonda, Hyderabad, Jagitial, Jangoan, Jayashankar Bhupalapally, Jogulamba Gadwal, Kamareddy, Karimnagar, Khammam, Kumuram Bheem Asifabad, Mahabubabad, Mahabubnagar, Mancherial, Medak, Medchal Malkajgiri, Mulugu, Nagarkurnool, Nalgonda, Narayanpet, Nirmal, Nizamabad, Peddapalli, Rajanna Sircilla, Rangareddy, Sangareddy, Siddipet, Suryapet, Vikarabad, Wanaparthy, Warangal, Yadadri Bhuvanagiri.

25. Tripura — 8
Dhalai, Gomati, Khowai, North Tripura, Sepahijala, South Tripura, Unakoti, West Tripura.

26. Uttar Pradesh — 75
Agra, Aligarh, Ambedkar Nagar, Amethi, Amroha, Auraiya, Ayodhya, Azamgarh, Baghpat, Bahraich, Ballia, Balrampur, Banda, Bara Banki, Bareilly, Basti, Bhadohi, Bijnor, Budaun, Bulandshahr, Chandauli, Chitrakoot, Deoria, Etah, Etawah, Farrukhabad, Fatehpur, Firozabad, Gautam Buddha Nagar, Ghaziabad, Ghazipur, Gonda, Gorakhpur, Hamirpur, Hapur, Hardoi, Hathras, Jalaun, Jaunpur, Jhansi, Kannauj, Kanpur Dehat, Kanpur Nagar, Kasganj, Kaushambi, Kheri, Kushinagar, Lalitpur, Lucknow, Maharajganj, Mahoba, Mainpuri, Mathura, Mau, Meerut, Mirzapur, Moradabad, Muzaffarnagar, Pilibhit, Pratapgarh, Prayagraj, Raebareli, Rampur, Saharanpur, Sambhal, Sant Kabir Nagar, Shahjahanpur, Shamli, Shravasti, Siddharthnagar, Sitapur, Sonbhadra, Sultanpur, Unnao, Varanasi.

27. Uttarakhand — 13
Almora, Bageshwar, Chamoli, Champawat, Dehradun, Haridwar, Nainital, Pauri Garhwal, Pithoragarh, Rudraprayag, Tehri Garhwal, Udham Singh Nagar, Uttarkashi.

28. West Bengal — 23
Alipurduar, Bankura, Birbhum, Cooch Behar, Dakshin Dinajpur, Darjeeling, Hooghly, Howrah, Jalpaiguri, Jhargram, Kalimpong, Kolkata, Malda, Murshidabad, Nadia, North 24 Parganas, Paschim Bardhaman, Paschim Medinipur, Purba Bardhaman, Purba Medinipur, Purulia, South 24 Parganas, Uttar Dinajpur.
"""

print("Seeding districts...")
total_districts_added = 0

lines = data.strip().split('\n')
current_state = None

for line in lines:
    line = line.strip()
    if not line:
        continue
    
    # State line: "1. Andhra Pradesh — 28"
    if '—' in line and line[0].isdigit():
        parts = line.split('—')[0]
        # Remove the number and dot "1. "
        state_name = parts.split('.', 1)[1].strip()
        
        try:
            current_state = State.objects.get(name__iexact=state_name)
        except State.DoesNotExist:
            print(f"ERROR: State '{state_name}' not found in database!")
            current_state = None
            
    elif current_state:
        # This line contains the districts, separated by commas
        # Remove trailing period if it exists
        if line.endswith('.'):
            line = line[:-1]
            
        districts = [d.strip() for d in line.split(',')]
        
        added = 0
        for d_name in districts:
            if not d_name:
                continue
            _, created = District.objects.get_or_create(
                state=current_state,
                name=d_name
            )
            if created:
                added += 1
                total_districts_added += 1
                
        print(f"Added {added} districts for {current_state.name}")

print(f"Finished! Added {total_districts_added} districts in total.")
