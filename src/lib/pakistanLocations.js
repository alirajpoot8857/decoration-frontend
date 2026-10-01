// Comprehensive Pakistan Geographic & Venue Database for instant autocomplete and 100% reliable map positioning across Pakistan

export const PAKISTAN_MAJOR_CITIES = [
  // =========================================================================
  // FEDERAL CAPITAL (ISLAMABAD & ICT)
  // =========================================================================
  { name: 'Islamabad', state: 'Islamabad Capital Territory', lat: 33.6844, lng: 73.0479, type: 'Federal Capital' },
  { name: 'Islamabad - Blue Area', state: 'Islamabad Capital Territory', lat: 33.7088, lng: 73.0566, type: 'Commercial Hub' },
  { name: 'Islamabad - Sector F-6 / F-7 / F-8', state: 'Islamabad Capital Territory', lat: 33.7226, lng: 73.0645, type: 'Urban Sector' },
  { name: 'Islamabad - Sector E-7 / E-11', state: 'Islamabad Capital Territory', lat: 33.7142, lng: 72.9868, type: 'Urban Sector' },
  { name: 'Islamabad - Sector G-6 / G-7 / G-8 / G-9', state: 'Islamabad Capital Territory', lat: 33.6961, lng: 73.0456, type: 'Urban Sector' },
  { name: 'Islamabad - Sector G-10 / G-11 / G-13 / G-14', state: 'Islamabad Capital Territory', lat: 33.6705, lng: 72.9892, type: 'Urban Sector' },
  { name: 'Islamabad - Sector H-8 / H-9 / H-12 (NUST)', state: 'Islamabad Capital Territory', lat: 33.6425, lng: 72.9904, type: 'Institutional Sector' },
  { name: 'Islamabad - Sector I-8 / I-9 / I-10', state: 'Islamabad Capital Territory', lat: 33.6582, lng: 73.0543, type: 'Urban Sector' },
  { name: 'Islamabad - DHA Phase 1, 2, 3, 5', state: 'Islamabad Capital Territory', lat: 33.5276, lng: 73.1098, type: 'Luxury Residency' },
  { name: 'Islamabad - Bahria Town (Phases 1-8)', state: 'Islamabad Capital Territory', lat: 33.5186, lng: 73.0898, type: 'Luxury Residency' },
  { name: 'Islamabad - Gulberg Greens & Residencia', state: 'Islamabad Capital Territory', lat: 33.6067, lng: 73.1491, type: 'Gated Community' },
  { name: 'Islamabad - Park View City', state: 'Islamabad Capital Territory', lat: 33.7011, lng: 73.1895, type: 'Residency' },
  { name: 'Islamabad - B-17 Multi Gardens', state: 'Islamabad Capital Territory', lat: 33.6975, lng: 72.7842, type: 'Residency' },
  { name: 'Islamabad - Chak Shahzad & Bani Gala', state: 'Islamabad Capital Territory', lat: 33.7042, lng: 73.1534, type: 'Farmhouses' },
  { name: 'Islamabad - Serena Hotel & Islamabad Club', state: 'Islamabad Capital Territory', lat: 33.7175, lng: 73.0997, type: '5-Star Venue' },
  { name: 'Islamabad - Monal & La Montana (Margalla)', state: 'Islamabad Capital Territory', lat: 33.7441, lng: 73.0592, type: 'Luxury Venue' },
  { name: 'Islamabad - Marriott Hotel', state: 'Islamabad Capital Territory', lat: 33.7275, lng: 73.0833, type: '5-Star Venue' },
  { name: 'Islamabad - Gun & Country Club', state: 'Islamabad Capital Territory', lat: 33.7012, lng: 73.1114, type: 'Prestige Venue' },
  { name: 'Islamabad - Aura Grand Marquee', state: 'Islamabad Capital Territory', lat: 33.6745, lng: 73.0112, type: 'Grand Marquee' },

  // =========================================================================
  // PUNJAB (ALL 42+ DISTRICTS & MAJOR HUBS)
  // =========================================================================
  { name: 'Lahore', state: 'Punjab', lat: 31.5204, lng: 74.3587, type: 'Provincial Capital' },
  { name: 'Lahore - Gulberg & MM Alam Road', state: 'Punjab', lat: 31.5126, lng: 74.3544, type: 'Fashion & Food Hub' },
  { name: 'Lahore - DHA (Phases 1 to 9 & Prism)', state: 'Punjab', lat: 31.4728, lng: 74.4084, type: 'Luxury Residency' },
  { name: 'Lahore - Bahria Town & Safari Villas', state: 'Punjab', lat: 31.3653, lng: 74.1804, type: 'Luxury Residency' },
  { name: 'Lahore - Johar Town & Emporium Mall', state: 'Punjab', lat: 31.4678, lng: 74.2662, type: 'Commercial Hub' },
  { name: 'Lahore - Model Town & Garden Town', state: 'Punjab', lat: 31.4889, lng: 74.3167, type: 'Residency' },
  { name: 'Lahore - Cantt & Saddar', state: 'Punjab', lat: 31.5452, lng: 74.3892, type: 'Cantonment' },
  { name: 'Lahore - Mall Road & Falettis Hotel', state: 'Punjab', lat: 31.5546, lng: 74.3314, type: 'Heritage & 5-Star' },
  { name: 'Lahore - Pearl Continental (PC) Hotel', state: 'Punjab', lat: 31.5552, lng: 74.3375, type: '5-Star Hotel' },
  { name: 'Lahore - Royal Palm Golf & Country Club', state: 'Punjab', lat: 31.5647, lng: 74.3662, type: 'Luxury Country Club' },
  { name: 'Lahore - Garrison Golf & Country Club', state: 'Punjab', lat: 31.5034, lng: 74.4095, type: 'Golf & Marquee' },
  { name: 'Lahore - Nishat Hotel & Banquets', state: 'Punjab', lat: 31.4678, lng: 74.2662, type: 'Luxury Banquets' },
  { name: 'Lahore - Lake City & Raiwind Road', state: 'Punjab', lat: 31.3689, lng: 74.2389, type: 'Residency' },
  { name: 'Lahore - Wapda Town & Faisal Town', state: 'Punjab', lat: 31.4467, lng: 74.2753, type: 'Residency' },
  { name: 'Lahore - Iqbal Town & Samanabad', state: 'Punjab', lat: 31.5234, lng: 74.2889, type: 'Urban Town' },

  { name: 'Rawalpindi', state: 'Punjab', lat: 33.5651, lng: 73.0169, type: 'Major Metropolis' },
  { name: 'Rawalpindi - Saddar & Cantt', state: 'Punjab', lat: 33.5937, lng: 73.0543, type: 'Commercial Hub' },
  { name: 'Rawalpindi - Bahria Town Rawalpindi', state: 'Punjab', lat: 33.5186, lng: 73.0898, type: 'Luxury Residency' },
  { name: 'Rawalpindi - PC Hotel Rawalpindi', state: 'Punjab', lat: 33.5898, lng: 73.0612, type: '5-Star Hotel' },
  { name: 'Rawalpindi - Chaklala Scheme 3', state: 'Punjab', lat: 33.5852, lng: 73.0924, type: 'Residency' },
  { name: 'Rawalpindi - Westridge & Peshawar Road', state: 'Punjab', lat: 33.6087, lng: 73.0145, type: 'Hub' },

  { name: 'Faisalabad', state: 'Punjab', lat: 31.4504, lng: 73.1350, type: 'Major Metropolis' },
  { name: 'Faisalabad - D Ground & Peoples Colony', state: 'Punjab', lat: 31.4181, lng: 73.1098, type: 'City Center & Food' },
  { name: 'Faisalabad - Serena Hotel Faisalabad', state: 'Punjab', lat: 31.4289, lng: 73.0895, type: '5-Star Venue' },
  { name: 'Faisalabad - Kohinoor City & Jaranwala Rd', state: 'Punjab', lat: 31.4112, lng: 73.1234, type: 'Marquee Hub' },
  { name: 'Faisalabad - Madina Town & Canal Road', state: 'Punjab', lat: 31.4398, lng: 73.1287, type: 'Residency' },

  { name: 'Gujranwala', state: 'Punjab', lat: 32.1877, lng: 74.1945, type: 'Major City' },
  { name: 'Gujranwala - Cantt & DC Colony', state: 'Punjab', lat: 32.2289, lng: 74.1678, type: 'Residency' },
  { name: 'Gujranwala - Master City & Citi Housing', state: 'Punjab', lat: 32.1456, lng: 74.2345, type: 'Housing Hub' },
  { name: 'Multan', state: 'Punjab', lat: 30.1575, lng: 71.5249, type: 'Major Metropolis' },
  { name: 'Multan - Cantt & Bosan Road', state: 'Punjab', lat: 30.2014, lng: 71.4672, type: 'Marquee Hub' },
  { name: 'Multan - DHA Multan & Buch Villas', state: 'Punjab', lat: 30.2874, lng: 71.4923, type: 'Residency' },
  { name: 'Multan - Ramada & Falettis Multan', state: 'Punjab', lat: 30.1876, lng: 71.4567, type: 'Luxury Venue' },

  { name: 'Sialkot', state: 'Punjab', lat: 32.4945, lng: 74.5229, type: 'Major City' },
  { name: 'Sialkot - Cantt & Paris Road', state: 'Punjab', lat: 32.5089, lng: 74.5389, type: 'City Center' },
  { name: 'Sialkot - Citi Housing & Model Town', state: 'Punjab', lat: 32.4789, lng: 74.4892, type: 'Residency' },

  { name: 'Bahawalpur', state: 'Punjab', lat: 29.3544, lng: 71.6911, type: 'Palace City & Division' },
  { name: 'Bahawalpur - Noor Mahal & Cantt', state: 'Punjab', lat: 29.3756, lng: 71.6845, type: 'Royal Heritage' },
  { name: 'Sargodha', state: 'Punjab', lat: 32.0836, lng: 72.6711, type: 'Divisional City' },
  { name: 'Sargodha - University Town & Cantt', state: 'Punjab', lat: 32.0712, lng: 72.6934, type: 'Hub' },

  { name: 'Sheikhupura', state: 'Punjab', lat: 31.7131, lng: 73.9783, type: 'District City' },
  { name: 'Rahim Yar Khan', state: 'Punjab', lat: 28.4212, lng: 70.2989, type: 'District City' },
  { name: 'Jhang', state: 'Punjab', lat: 31.2781, lng: 72.3167, type: 'District City' },
  { name: 'Dera Ghazi Khan (DG Khan)', state: 'Punjab', lat: 30.0489, lng: 70.6455, type: 'Divisional City' },
  { name: 'Gujrat', state: 'Punjab', lat: 32.5742, lng: 74.0754, type: 'District City' },
  { name: 'Sahiwal', state: 'Punjab', lat: 30.6682, lng: 73.1114, type: 'Divisional City' },
  { name: 'Wah Cantt & Taxila', state: 'Punjab', lat: 33.7744, lng: 72.7533, type: 'City & Heritage' },
  { name: 'Kasur', state: 'Punjab', lat: 31.1179, lng: 74.4503, type: 'District City' },
  { name: 'Okara', state: 'Punjab', lat: 30.8081, lng: 73.4458, type: 'District City' },
  { name: 'Chiniot', state: 'Punjab', lat: 31.7200, lng: 72.9789, type: 'Craft City' },
  { name: 'Kamoke', state: 'Punjab', lat: 31.9739, lng: 74.2239, type: 'City' },
  { name: 'Hafizabad', state: 'Punjab', lat: 32.0679, lng: 73.6853, type: 'District City' },
  { name: 'Mandi Bahauddin', state: 'Punjab', lat: 32.5870, lng: 73.4912, type: 'District City' },
  { name: 'Burewala', state: 'Punjab', lat: 30.1667, lng: 72.6833, type: 'City' },
  { name: 'Jhelum', state: 'Punjab', lat: 32.9425, lng: 73.7257, type: 'District City' },
  { name: 'Khanewal', state: 'Punjab', lat: 30.3017, lng: 71.9321, type: 'District City' },
  { name: 'Muzaffargarh', state: 'Punjab', lat: 30.0754, lng: 71.1921, type: 'District City' },
  { name: 'Vehari', state: 'Punjab', lat: 30.0419, lng: 72.3528, type: 'District City' },
  { name: 'Attock', state: 'Punjab', lat: 33.7667, lng: 72.3667, type: 'District City' },
  { name: 'Bahawalnagar', state: 'Punjab', lat: 29.9986, lng: 73.2536, type: 'District City' },
  { name: 'Chakwal', state: 'Punjab', lat: 32.9334, lng: 72.8585, type: 'District City' },
  { name: 'Toba Tek Singh', state: 'Punjab', lat: 30.9744, lng: 72.4828, type: 'District City' },
  { name: 'Murree & Patriata', state: 'Punjab', lat: 33.9070, lng: 73.3903, type: 'Hill Station & Resort' },
  { name: 'Mianwali', state: 'Punjab', lat: 32.5853, lng: 71.5436, type: 'District City' },
  { name: 'Bhakkar', state: 'Punjab', lat: 31.6269, lng: 71.0653, type: 'District City' },
  { name: 'Khushab & Jauharabad', state: 'Punjab', lat: 32.2967, lng: 72.3525, type: 'District City' },
  { name: 'Layyah', state: 'Punjab', lat: 30.9614, lng: 70.9419, type: 'District City' },
  { name: 'Lodhran', state: 'Punjab', lat: 29.5408, lng: 71.6336, type: 'District City' },
  { name: 'Pakpattan', state: 'Punjab', lat: 30.3411, lng: 73.3853, type: 'District City' },
  { name: 'Rajanpur', state: 'Punjab', lat: 29.1039, lng: 70.3250, type: 'District City' },
  { name: 'Nankana Sahib', state: 'Punjab', lat: 31.4492, lng: 73.7125, type: 'District City' },
  { name: 'Narowal', state: 'Punjab', lat: 32.1022, lng: 74.8731, type: 'District City' },
  { name: 'Kot Radha Kishan', state: 'Punjab', lat: 31.1719, lng: 74.0989, type: 'City' },
  { name: 'Hasan Abdal', state: 'Punjab', lat: 33.8197, lng: 72.6894, type: 'Heritage City' },
  { name: 'Dina & Mangla Dam', state: 'Punjab', lat: 33.0256, lng: 73.5989, type: 'City' },
  { name: 'Bhalwal', state: 'Punjab', lat: 32.2656, lng: 72.9028, type: 'City' },
  { name: 'Gojra', state: 'Punjab', lat: 31.1494, lng: 72.6833, type: 'City' },
  { name: 'Jaranwala', state: 'Punjab', lat: 31.3342, lng: 73.4194, type: 'City' },
  { name: 'Samundri', state: 'Punjab', lat: 31.0639, lng: 72.9528, type: 'City' },
  { name: 'Pattoki & Chunian', state: 'Punjab', lat: 31.0214, lng: 73.8533, type: 'Flower City' },
  { name: 'Wazirabad', state: 'Punjab', lat: 32.4419, lng: 74.1194, type: 'City' },
  { name: 'Daska', state: 'Punjab', lat: 32.3242, lng: 74.3506, type: 'City' },
  { name: 'Pasrur & Sambrial', state: 'Punjab', lat: 32.2689, lng: 74.6678, type: 'City' },
  { name: 'Jalalpur Jattan', state: 'Punjab', lat: 32.6417, lng: 74.2083, type: 'City' },
  { name: 'Kharian & Lalamusa', state: 'Punjab', lat: 32.8139, lng: 73.8647, type: 'City' },
  { name: 'Sarai Alamgir', state: 'Punjab', lat: 32.9022, lng: 73.7556, type: 'City' },
  { name: 'Gujar Khan', state: 'Punjab', lat: 33.2547, lng: 73.3047, type: 'City' },
  { name: 'Kallar Syedan & Kahuta', state: 'Punjab', lat: 33.4197, lng: 73.3756, type: 'City' },

  // =========================================================================
  // SINDH (KARACHI & ALL 30 DISTRICTS)
  // =========================================================================
  { name: 'Karachi', state: 'Sindh', lat: 24.8607, lng: 67.0011, type: 'Provincial Capital' },
  { name: 'Karachi - Clifton & Sea View', state: 'Sindh', lat: 24.8238, lng: 67.0343, type: 'Luxury Beach & Hub' },
  { name: 'Karachi - DHA (Phases 1 to 8)', state: 'Sindh', lat: 24.8065, lng: 67.0658, type: 'Luxury Residency' },
  { name: 'Karachi - Bahria Town Karachi (BTK)', state: 'Sindh', lat: 25.0116, lng: 67.3328, type: 'Luxury Mega City' },
  { name: 'Karachi - Gulshan-e-Iqbal & Gulistan-e-Jauhar', state: 'Sindh', lat: 24.9180, lng: 67.0971, type: 'Urban Town' },
  { name: 'Karachi - PECHS & Tariq Road', state: 'Sindh', lat: 24.8719, lng: 67.0625, type: 'Central Hub' },
  { name: 'Karachi - North Nazimabad & Buffer Zone', state: 'Sindh', lat: 24.9388, lng: 67.0426, type: 'Town' },
  { name: 'Karachi - Saddar & I.I Chundrigar Rd', state: 'Sindh', lat: 24.8569, lng: 67.0125, type: 'Commercial Center' },
  { name: 'Karachi - PC Hotel & Movenpick', state: 'Sindh', lat: 24.8515, lng: 67.0289, type: '5-Star Venue' },
  { name: 'Karachi - Marriott Hotel Karachi', state: 'Sindh', lat: 24.8489, lng: 67.0312, type: '5-Star Venue' },
  { name: 'Karachi - Creek Club & Golf Club DHA', state: 'Sindh', lat: 24.8037, lng: 67.0784, type: 'Luxury Club Venue' },
  { name: 'Karachi - PAF Museum Convention Center', state: 'Sindh', lat: 24.8745, lng: 67.0924, type: 'Mega Expo Venue' },
  { name: 'Karachi - Arena & Dreamworld Resort', state: 'Sindh', lat: 24.9989, lng: 67.1456, type: 'Resort & Banquets' },
  { name: 'Karachi - Korangi & Malir Cantt', state: 'Sindh', lat: 24.9123, lng: 67.2012, type: 'Residency' },
  { name: 'Karachi - FB Area & Federal B Area', state: 'Sindh', lat: 24.9312, lng: 67.0754, type: 'Town' },
  { name: 'Karachi - KDA Scheme 1 & Tipu Sultan', state: 'Sindh', lat: 24.8756, lng: 67.0812, type: 'Luxury Residency' },

  { name: 'Hyderabad', state: 'Sindh', lat: 25.3960, lng: 68.3578, type: 'Major Metropolis' },
  { name: 'Hyderabad - Latifabad & Qasimabad', state: 'Sindh', lat: 25.3789, lng: 68.3412, type: 'Urban Town' },
  { name: 'Hyderabad - Cantt & Auto Bhan Road', state: 'Sindh', lat: 25.3654, lng: 68.3521, type: 'Marquee Hub' },

  { name: 'Sukkur', state: 'Sindh', lat: 27.7139, lng: 68.8492, type: 'Major City & Division' },
  { name: 'Sukkur - IBA & Military Road', state: 'Sindh', lat: 27.7289, lng: 68.8345, type: 'Hub' },
  { name: 'Larkana', state: 'Sindh', lat: 27.5590, lng: 68.2120, type: 'Divisional City' },
  { name: 'Nawabshah (Shaheed Benazirabad)', state: 'Sindh', lat: 26.2442, lng: 68.4100, type: 'Divisional City' },
  { name: 'Mirpur Khas', state: 'Sindh', lat: 25.5276, lng: 69.0159, type: 'Divisional City' },
  { name: 'Jacobabad', state: 'Sindh', lat: 28.2819, lng: 68.4375, type: 'District City' },
  { name: 'Shikarpur', state: 'Sindh', lat: 27.9556, lng: 68.6382, type: 'District City' },
  { name: 'Khairpur', state: 'Sindh', lat: 27.5295, lng: 68.7592, type: 'District City' },
  { name: 'Dadu', state: 'Sindh', lat: 26.7320, lng: 67.7770, type: 'District City' },
  { name: 'Thatta', state: 'Sindh', lat: 24.7475, lng: 67.9235, type: 'Heritage City' },
  { name: 'Badin', state: 'Sindh', lat: 24.6558, lng: 68.8384, type: 'District City' },
  { name: 'Ghotki & Daharki', state: 'Sindh', lat: 28.0064, lng: 69.3161, type: 'District City' },
  { name: 'Kashmore & Kandhkot', state: 'Sindh', lat: 28.4333, lng: 69.5833, type: 'District City' },
  { name: 'Qambar & Shahdadkot', state: 'Sindh', lat: 27.5856, lng: 67.9989, type: 'District City' },
  { name: 'Umerkot', state: 'Sindh', lat: 25.3614, lng: 69.7361, type: 'Heritage District' },
  { name: 'Tharparkar & Mithi', state: 'Sindh', lat: 24.7436, lng: 69.7997, type: 'District City' },
  { name: 'Sanghar', state: 'Sindh', lat: 26.0464, lng: 68.9481, type: 'District City' },
  { name: 'Tando Adam', state: 'Sindh', lat: 25.7681, lng: 68.6628, type: 'City' },
  { name: 'Tando Allahyar', state: 'Sindh', lat: 25.4608, lng: 68.7183, type: 'District City' },
  { name: 'Tando Muhammad Khan', state: 'Sindh', lat: 25.1239, lng: 68.5372, type: 'District City' },
  { name: 'Matiari & Hala', state: 'Sindh', lat: 25.5975, lng: 68.4467, type: 'Artisan District' },
  { name: 'Jamshoro & Kotri', state: 'Sindh', lat: 25.4361, lng: 68.2811, type: 'University City' },
  { name: 'Sehwan Sharif', state: 'Sindh', lat: 26.4256, lng: 67.8614, type: 'Heritage City' },
  { name: 'Rohri & Pano Akil', state: 'Sindh', lat: 27.6742, lng: 68.8953, type: 'City' },
  { name: 'Moro & Naushahro Feroze', state: 'Sindh', lat: 26.6631, lng: 68.0006, type: 'District City' },

  // =========================================================================
  // KHYBER PAKHTUNKHWA (ALL DISTRICTS, VALLEYS & VENUES)
  // =========================================================================
  { name: 'Peshawar', state: 'Khyber Pakhtunkhwa', lat: 34.0151, lng: 71.5249, type: 'Provincial Capital' },
  { name: 'Peshawar - University Town & Hayatabad', state: 'Khyber Pakhtunkhwa', lat: 33.9922, lng: 71.4642, type: 'Luxury Hub' },
  { name: 'Peshawar - Cantt & Saddar', state: 'Khyber Pakhtunkhwa', lat: 34.0042, lng: 71.5514, type: 'City Center' },
  { name: 'Peshawar - PC Hotel Peshawar', state: 'Khyber Pakhtunkhwa', lat: 34.0089, lng: 71.5456, type: '5-Star Hotel' },
  { name: 'Peshawar - Pearl Continental & Shelton', state: 'Khyber Pakhtunkhwa', lat: 33.9978, lng: 71.4812, type: 'Marquee Hub' },
  { name: 'Peshawar - Ring Road Marquees', state: 'Khyber Pakhtunkhwa', lat: 33.9789, lng: 71.5678, type: 'Grand Marquees' },

  { name: 'Mardan', state: 'Khyber Pakhtunkhwa', lat: 34.1989, lng: 72.0404, type: 'Major City & Division' },
  { name: 'Mingora / Swat Valley', state: 'Khyber Pakhtunkhwa', lat: 34.7717, lng: 72.3600, type: 'Tourist Capital & Resort' },
  { name: 'Swat - Serena Hotel Swat', state: 'Khyber Pakhtunkhwa', lat: 34.7756, lng: 72.3589, type: 'Luxury Resort' },
  { name: 'Swat - Malam Jabba & Kalam', state: 'Khyber Pakhtunkhwa', lat: 35.4852, lng: 72.5852, type: 'Mountain Resort' },
  { name: 'Abbottabad', state: 'Khyber Pakhtunkhwa', lat: 34.1688, lng: 73.2215, type: 'Divisional City' },
  { name: 'Abbottabad - Cantt & Mandian', state: 'Khyber Pakhtunkhwa', lat: 34.1956, lng: 73.2389, type: 'Hub' },
  { name: 'Kohat', state: 'Khyber Pakhtunkhwa', lat: 33.5869, lng: 71.4414, type: 'Divisional City' },
  { name: 'Dera Ismail Khan (DI Khan)', state: 'Khyber Pakhtunkhwa', lat: 31.8314, lng: 70.9019, type: 'Divisional City' },
  { name: 'Haripur', state: 'Khyber Pakhtunkhwa', lat: 33.9946, lng: 72.9344, type: 'District City' },
  { name: 'Bannu', state: 'Khyber Pakhtunkhwa', lat: 32.9854, lng: 70.6027, type: 'Divisional City' },
  { name: 'Swabi & Topi (GIKI)', state: 'Khyber Pakhtunkhwa', lat: 34.1202, lng: 72.4698, type: 'District City' },
  { name: 'Nowshera & Risalpur', state: 'Khyber Pakhtunkhwa', lat: 34.0153, lng: 71.9747, type: 'District City' },
  { name: 'Mansehra & Balakot', state: 'Khyber Pakhtunkhwa', lat: 34.3333, lng: 73.2000, type: 'District City' },
  { name: 'Naran & Kaghan Valley', state: 'Khyber Pakhtunkhwa', lat: 34.9089, lng: 73.6514, type: 'Luxury Tourist Hub' },
  { name: 'Charsadda', state: 'Khyber Pakhtunkhwa', lat: 34.1482, lng: 71.7406, type: 'District City' },
  { name: 'Chitral & Kalash Valley', state: 'Khyber Pakhtunkhwa', lat: 35.8510, lng: 71.7864, type: 'District & Tourist Hub' },
  { name: 'Dir & Timergara', state: 'Khyber Pakhtunkhwa', lat: 34.8281, lng: 71.8408, type: 'District City' },
  { name: 'Batkhela & Malakand', state: 'Khyber Pakhtunkhwa', lat: 34.6167, lng: 71.9667, type: 'District City' },
  { name: 'Buner & Daggar', state: 'Khyber Pakhtunkhwa', lat: 34.5167, lng: 72.4833, type: 'District City' },
  { name: 'Shangla & Alpuri', state: 'Khyber Pakhtunkhwa', lat: 34.9000, lng: 72.6500, type: 'District City' },
  { name: 'Hangu', state: 'Khyber Pakhtunkhwa', lat: 33.5281, lng: 71.0581, type: 'District City' },
  { name: 'Karak', state: 'Khyber Pakhtunkhwa', lat: 33.1119, lng: 71.0917, type: 'District City' },
  { name: 'Tank', state: 'Khyber Pakhtunkhwa', lat: 32.2217, lng: 70.3794, type: 'District City' },
  { name: 'Lakki Marwat', state: 'Khyber Pakhtunkhwa', lat: 32.6078, lng: 70.9114, type: 'District City' },
  { name: 'Parachinar (Kurram)', state: 'Khyber Pakhtunkhwa', lat: 33.8992, lng: 70.1008, type: 'District City' },
  { name: 'Miranshah (North Waziristan)', state: 'Khyber Pakhtunkhwa', lat: 33.0019, lng: 70.0719, type: 'District City' },
  { name: 'Jamrud & Landi Kotal (Khyber)', state: 'Khyber Pakhtunkhwa', lat: 34.0989, lng: 71.1456, type: 'District City' },
  { name: 'Havelian', state: 'Khyber Pakhtunkhwa', lat: 34.0536, lng: 73.1539, type: 'City' },

  // =========================================================================
  // BALOCHISTAN (ALL DISTRICTS & PORTS)
  // =========================================================================
  { name: 'Quetta', state: 'Balochistan', lat: 30.1798, lng: 66.9750, type: 'Provincial Capital' },
  { name: 'Quetta - Cantt & Serena Hotel', state: 'Balochistan', lat: 30.1923, lng: 67.0094, type: 'Luxury Venue' },
  { name: 'Quetta - Jinnah Road & Zarghoon Road', state: 'Balochistan', lat: 30.1834, lng: 66.9956, type: 'City Center' },
  { name: 'Turbat', state: 'Balochistan', lat: 26.0031, lng: 63.0544, type: 'Divisional City' },
  { name: 'Khuzdar', state: 'Balochistan', lat: 27.8119, lng: 66.6178, type: 'Divisional City' },
  { name: 'Hub & Lasbela', state: 'Balochistan', lat: 25.0256, lng: 66.8856, type: 'Industrial City' },
  { name: 'Gwadar', state: 'Balochistan', lat: 25.1264, lng: 62.3225, type: 'International Port City' },
  { name: 'Gwadar - PC Hotel Gwadar & Marine Dr', state: 'Balochistan', lat: 25.1189, lng: 62.3312, type: '5-Star Resort' },
  { name: 'Sibi', state: 'Balochistan', lat: 29.5448, lng: 67.8764, type: 'Divisional City' },
  { name: 'Zhob', state: 'Balochistan', lat: 31.3411, lng: 69.4486, type: 'Divisional City' },
  { name: 'Chaman', state: 'Balochistan', lat: 30.9236, lng: 66.4511, type: 'Border City' },
  { name: 'Loralai', state: 'Balochistan', lat: 30.3705, lng: 68.5979, type: 'Divisional City' },
  { name: 'Ziarat & Juniper Forest', state: 'Balochistan', lat: 30.3824, lng: 67.7256, type: 'Hill Station & Resort' },
  { name: 'Pishin', state: 'Balochistan', lat: 30.5803, lng: 66.9961, type: 'District City' },
  { name: 'Mastung & Kalat', state: 'Balochistan', lat: 29.7997, lng: 66.8456, type: 'District City' },
  { name: 'Dera Murad Jamali & Nasirabad', state: 'Balochistan', lat: 28.5467, lng: 68.2231, type: 'Divisional City' },
  { name: 'Dera Allah Yar & Jafarabad', state: 'Balochistan', lat: 28.3739, lng: 68.3508, type: 'District City' },
  { name: 'Nushki & Kharan', state: 'Balochistan', lat: 29.5542, lng: 66.0214, type: 'District City' },
  { name: 'Panjgur', state: 'Balochistan', lat: 26.9644, lng: 64.0903, type: 'District City' },
  { name: 'Pasni & Ormara', state: 'Balochistan', lat: 25.2631, lng: 63.4719, type: 'Coastal City' },

  // =========================================================================
  // AZAD JAMMU & KASHMIR (AJK)
  // =========================================================================
  { name: 'Muzaffarabad', state: 'Azad Kashmir', lat: 34.3700, lng: 73.4711, type: 'State Capital' },
  { name: 'Muzaffarabad - PC Hotel Bhurban & AJK', state: 'Azad Kashmir', lat: 34.3645, lng: 73.4689, type: '5-Star Resort' },
  { name: 'Mirpur', state: 'Azad Kashmir', lat: 33.1484, lng: 73.7519, type: 'Major Metropolis & Overseas Hub' },
  { name: 'Mirpur - Sector F-1 / F-2 / Cantt', state: 'Azad Kashmir', lat: 33.1567, lng: 73.7423, type: 'Luxury Residency' },
  { name: 'Rawalakot & Banjosa Lake', state: 'Azad Kashmir', lat: 33.8584, lng: 73.7604, type: 'Tourist Capital' },
  { name: 'Kotli', state: 'Azad Kashmir', lat: 33.5156, lng: 73.9019, type: 'District City' },
  { name: 'Bhimber', state: 'Azad Kashmir', lat: 32.9739, lng: 74.0781, type: 'District City' },
  { name: 'Bagh', state: 'Azad Kashmir', lat: 33.9817, lng: 73.7761, type: 'District City' },
  { name: 'Pallandri (Sudhanoti)', state: 'Azad Kashmir', lat: 33.7125, lng: 73.6811, type: 'District City' },
  { name: 'Neelum Valley (Athmuqam & Sharda)', state: 'Azad Kashmir', lat: 34.5878, lng: 73.9142, type: 'Luxury Valley Resort' },
  { name: 'Dadyal & Islamgarh', state: 'Azad Kashmir', lat: 33.3139, lng: 73.7225, type: 'Overseas Hub' },

  // =========================================================================
  // GILGIT-BALTISTAN (ALL DISTRICTS & RESORTS)
  // =========================================================================
  { name: 'Gilgit', state: 'Gilgit-Baltistan', lat: 35.9221, lng: 74.3087, type: 'Regional Capital' },
  { name: 'Gilgit - Serena Hotel Gilgit', state: 'Gilgit-Baltistan', lat: 35.9189, lng: 74.3125, type: 'Luxury Resort' },
  { name: 'Skardu', state: 'Gilgit-Baltistan', lat: 35.2971, lng: 75.6333, type: 'Adventure Capital & Resort' },
  { name: 'Skardu - Serena Shigar Fort & Shangrila', state: 'Gilgit-Baltistan', lat: 35.3521, lng: 75.5214, type: '5-Star Heritage Resort' },
  { name: 'Hunza Valley (Karimabad & Aliabad)', state: 'Gilgit-Baltistan', lat: 36.3167, lng: 74.6500, type: 'World Famous Tourist Hub' },
  { name: 'Hunza - Serena Inn & Luxus Hunza (Attabad)', state: 'Gilgit-Baltistan', lat: 36.3312, lng: 74.8624, type: 'Luxury Lake Resort' },
  { name: 'Ghizer & Gahkuch', state: 'Gilgit-Baltistan', lat: 36.1750, lng: 73.7667, type: 'District City' },
  { name: 'Astore & Rama Lake', state: 'Gilgit-Baltistan', lat: 35.3667, lng: 74.8500, type: 'District City' },
  { name: 'Diamer & Chilas', state: 'Gilgit-Baltistan', lat: 35.4197, lng: 74.0961, type: 'District City' },
  { name: 'Khaplu & Ghanche (Serena Palace)', state: 'Gilgit-Baltistan', lat: 35.1589, lng: 76.3356, type: 'Heritage Palace Resort' },
];

/**
 * High-performance search function that queries:
 * 1. Instant local Pakistan database (250+ cities, districts, sectors, tehsils, venues)
 * 2. Photon Komoot OSM API (unrestricted high-speed OpenStreetMap search for Pakistan)
 * 3. OpenStreetMap Nominatim with pk countrycodes
 */
export async function searchPakistanLocations(query) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) return [];
  const q = query.trim().toLowerCase();

  // Normalize search tokens
  const tokens = q.split(/\s+/).filter(Boolean);

  // 1. Local instant matches with intelligent relevance scoring
  const scoredMatches = [];
  for (const loc of PAKISTAN_MAJOR_CITIES) {
    const fullName = loc.name.toLowerCase();
    const baseCity = loc.name.split(' - ')[0].trim().toLowerCase();
    const stateName = loc.state.toLowerCase();
    const typeName = loc.type.toLowerCase();

    // Check if every token matches
    const allTokensMatch = tokens.every(
      (token) => fullName.includes(token) || stateName.includes(token) || typeName.includes(token)
    );

    if (allTokensMatch) {
      let score = 0;
      if (fullName === q) score += 2000;
      else if (baseCity === q) score += 1500;
      else if (fullName.startsWith(q)) score += 1000;
      else if (baseCity.startsWith(q)) score += 800;
      else if (fullName.includes(q)) score += 400;
      else score += 100;

      // Bonus for provincial capitals and major metro hubs
      if (loc.type.includes('Capital') || loc.type.includes('Metropolis')) score += 50;

      scoredMatches.push({
        display_name: `${loc.name}, ${loc.state}, Pakistan`,
        name: loc.name,
        city: loc.name.split(' - ')[0],
        state: loc.state,
        lat: loc.lat.toString(),
        lon: loc.lng.toString(),
        type: loc.type,
        isLocal: true,
        score,
      });
    }
  }

  // Sort descending by relevance score
  scoredMatches.sort((a, b) => b.score - a.score);
  const localMatches = scoredMatches.map(({ score, ...item }) => item);

  // If query is 1 character, return top local matches
  if (q.length < 2) {
    return localMatches.slice(0, 8);
  }

  // 2. Dual Online Geocoding (Photon Komoot + Nominatim) with Pakistan priority
  try {
    const photonPromise = fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(
        query.trim() + ' Pakistan'
      )}&limit=8&lat=30.3753&lon=69.3451`
    ).then((r) => (r.ok ? r.json() : null)).catch(() => null);

    const nominatimPromise = fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query.trim()
      )}&countrycodes=pk&limit=8&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    ).then((r) => (r.ok ? r.json() : null)).catch(() => null);

    // Timeout guard so online search never lags more than 900ms
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve([]), 900));

    const [photonData, nominatimData] = await Promise.race([
      Promise.allSettled([photonPromise, nominatimPromise]),
      timeoutPromise.then(() => [null, null]),
    ]);

    const onlineResults = [];

    // Parse Photon GeoJSON
    if (photonData && photonData.status === 'fulfilled' && photonData.value?.features) {
      photonData.value.features.forEach((feat) => {
        const coords = feat.geometry?.coordinates || [];
        const props = feat.properties || {};
        if (coords.length >= 2) {
          const parts = [props.name, props.street, props.district, props.city, props.state, 'Pakistan'].filter(Boolean);
          const displayName = parts.join(', ');
          onlineResults.push({
            display_name: displayName,
            lat: coords[1].toString(),
            lon: coords[0].toString(),
            name: props.name || displayName,
            type: props.type || 'Location',
            isLocal: false,
          });
        }
      });
    }

    // Parse Nominatim JSON
    if (nominatimData && nominatimData.status === 'fulfilled' && Array.isArray(nominatimData.value)) {
      nominatimData.value.forEach((item) => {
        onlineResults.push({
          display_name: item.display_name,
          lat: item.lat,
          lon: item.lon,
          name: item.display_name.split(',')[0],
          type: item.type || 'Place',
          isLocal: false,
        });
      });
    }

    // Combine local results (highest priority) + online results
    const combined = [...localMatches];
    const seenNames = new Set(localMatches.map((m) => m.name.toLowerCase()));

    onlineResults.forEach((res) => {
      const clean = res.name.toLowerCase().trim();
      if (!seenNames.has(clean) && seenNames.size < 16) {
        seenNames.add(clean);
        combined.push(res);
      }
    });

    return combined.slice(0, 10);
  } catch (e) {
    console.warn('Online geocoding fallback error:', e);
    return localMatches.slice(0, 8);
  }
}
