import mongoose from 'mongoose';
import NewsPost from '../models/NewsPost.js';
import Category from '../models/Category.js';
import Source from '../models/Source.js';
import AdminUser from '../models/AdminUser.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { getPremiumImage } from '../lib/imageHelper.js';

// Parse .env manually
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const parts = line.split('=');
    if (parts.length === 2) {
      process.env[parts[0].trim()] = parts[1].trim();
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/news-aggregator';

const CATEGORIES = [
  'Technology', 'Sports', 'Education', 'Men', 'Women', 'Children',
  'Accidents', 'Local', 'National', 'International', 'Business',
  'Health', 'Jobs', 'Entertainment', 'Politics', 'Science'
];

const TRUSTED_SOURCES = [
  { name: 'BBC News', url: 'https://www.bbc.com' },
  { name: 'Reuters', url: 'https://www.reuters.com' },
  { name: 'TechCrunch', url: 'https://techcrunch.com' },
  { name: 'ESPN', url: 'https://www.espn.com' },
  { name: 'Bloomberg', url: 'https://www.bloomberg.com' },
  { name: 'CNN News', url: 'https://www.cnn.com' },
  { name: 'The New York Times', url: 'https://www.nytimes.com' },
  { name: 'CNBC Finance', url: 'https://www.cnbc.com' },
];

const SUBJECTS = {
  Technology: ['Quantum Computing', 'Artificial Intelligence', 'Cybersecurity Protocols', 'Semiconductor Chips', 'Cloud Frameworks', 'Autonomous Vehicles', 'Edge Computing', 'Green Energy Grids', 'Biometric Sensors', 'Augmented Reality'],
  Sports: ['Championship Tournament', 'Olympic Selection Committee', 'Athletic Association', 'Football League', 'Cricket Board', 'Tennis Association', 'Formula One Grand Prix', 'Basketball Finals', 'World Swimming Cup', 'Gymnastics Federation'],
  Education: ['Primary School Curriculums', 'University Consortia', 'Vocational Training Programs', 'Online Learning Platforms', 'Literacy Campaigns', 'Double Degree Programs', 'Scientific Research Fellowships', 'Coding Bootcamps', 'STEM Interactive Kits', 'Language Immersion Centers'],
  Men: ['Cardiovascular Health Study', 'Mental Health Coalition', 'Workspace Ergonomics Forum', 'Mens Lifestyle Trends', 'Nutrition and Metabolism Research', 'Fitness Training Methods', 'Stress Management Framework', 'Preventive Care Guidelines', 'Executive Leadership Development', 'Community Mentorship Initiatives'],
  Women: ['Entrepreneurship Grants', 'Corporate Leadership Summit', 'Maternity Health Networks', 'Womens Rights Coalition', 'Clean Tech Startup Awards', 'Professional Leagues Expansion', 'Scientific Research Awards', 'Mentorship and Funding Programs', 'Equal Pay Initiatives', 'Wellness and Nutrition Studies'],
  Children: ['Early Childhood Care Grants', 'Pediatric Sleep Guidelines', 'Interactive STEAM Science Kits', 'National Child Welfare Policies', 'Urban Playground Initiatives', 'Screentime and Development Reports', 'Literacy and Language Milestones', 'Nutritional Support Programs', 'Creative Art Workshops', 'Safety and Protection Services'],
  Accidents: ['Express Train Derailment', 'Highway Cargo Transport Collision', 'Industrial Chemical Storage Fire', 'Coastal Storm Marine Alert', 'City Building Scaffold Collapse', 'Subway System Power Interruption', 'Warehouse Facility Structural Hazard', 'Mountain Highway Landslide', 'Commercial Port Docking Incident', 'Aviation Safety Investigation'],
  Local: ['Vizag Beach Cleaning Drive', 'Visakhapatnam Metropolitan Authority', 'Vizag Smart Port Project', 'Andhra Pradesh Electric Bus Fleet', 'Visakhapatnam IT Park Expansion', 'Vizag Fishery Harbor Modernization', 'Andhra Pradesh Clean Water Initiative', 'Vizag Urban Housing Development', 'Visakhapatnam Metro Rail Feasibility', 'Vizag Tourism Expansion Plans'],
  National: ['National Expressway Expansion Project', 'Central Bank Digital Currency Phase Two', 'Forest Boundary Conservation Registry', 'National Smart Grid Deployment', 'Rural Electrification Milestone', 'High-Speed Railway Corridor Launch', 'National Health Insurance Database', 'Agricultural Subsidies Framework', 'Defense Sector Modernization Program', 'Clean Energy Storage Facilities'],
  International: ['Global Trade Compliance Standards', 'International Space Station Solar Array', 'UN Oceanic Wildlife Conservation', 'World Tourism Traffic Projection', 'Global Carbon Offsetting Treaties', 'International Cyber-Defense Alliance', 'Global Food Security Initiatives', 'World Monetary Fund Interest Rates', 'Cross-Border Renewable Energy Pipelines', 'Global Intellectual Property Treaties'],
  Business: ['Fintech Startup Capital Funding', 'Retail Conglomerate Biodegradable Packaging', 'Real Estate Investment Trust Yields', 'Commercial Drone Delivery Launch', 'Global Supply Chain Optimization', 'E-commerce Automation Integration', 'Venture Capital Tech Investment', 'Commercial Banking Liquidity Assets', 'Renewable Energy Project Mergers', 'Consumer Retail Market Survey'],
  Health: ['Clinical Trial Cardiovascular Drug', 'Global Wellness Alliance Ergonomics', 'Rural Telemedicine Consultation Platforms', 'Nutrition Coalition Sugar Reduction', 'Immunology Research Lab Discovery', 'Preventive Health Checkup Protocols', 'Mental Health Counseling Access', 'Oncology Research Equipment Grant', 'Diabetes Management Smart Devices', 'Clean Drinking Water Health Impact'],
  Jobs: ['Technology Sector Cybersecurity Hiring', 'Green Infrastructure Construction Careers', 'Regional Technical Jobs Fair', 'Remote Workspace Flexible Standards', 'AI Integration Workforce Retraining', 'Vocational Apprenticeship Growth', 'Healthcare Staffing Shortage Solutions', 'Gig Economy Worker Protections', 'Corporate Diversity Hiring Metrics', 'Creative Industry Freelance Platforms'],
  Entertainment: ['Independent Film Festival Awards', 'Live Orchestra Audio Modulation', 'Annual Theater Writing Grants', 'Streaming Platform Historical Adaptations', 'International Art Exhibition Curations', 'Museum Virtual Gallery Tours', 'Music Production Software Standards', 'Regional Dance Festival Showcases', 'Popular Culture Convention Returns', 'Historical Fiction Literary Awards'],
  Politics: ['Electoral Commission Voting Machine', 'Municipal Citizen Budget Committees', 'Parliament Environmental Protection Acts', 'Public Utility Pricing Reform Proposals', 'National Security Advisory Committee', 'Local Government Transparency Portal', 'Regional Trade Agreement Debates', 'Urban Infrastructure Funding Approvals', 'Education Funding Policy Review', 'Agricultural Land Zoning Reforms'],
  Science: ['Exoplanet Atmosphere Deep-Space Images', 'Ocean Trench Deep Sea Species Discovery', 'Super-Light Carbon Graphene Synthesis', 'Arid Region Aquifer Mapping', 'Geothermal Heat Energy Drilling', 'Superconducting Material Experiments', 'Quantum Chemistry Molecule Modeling', 'Paleontological Fossil Excavation', 'Atmospheric Carbon capture Trials', 'Genomic Sequencing Diversity Studies']
};

const ACTIONS = [
  'announces major breakthrough in research and development',
  'initiates collaborative initiative for public welfare',
  'completes comprehensive review of operational safety',
  'receives widespread praise from industry stakeholders',
  'implements new standards to improve compliance and quality',
  'registers record-breaking performance in recent evaluations',
  'proposes innovative policies to address modern challenges',
  'establishes dedicated committee to coordinate efforts',
  'launches state-of-the-art framework for digital integration',
  'reveals detailed findings from international consultations'
];

const MODIFIERS = [
  'for immediate deployment',
  'with support from local authorities',
  'aiming to enhance long-term sustainability',
  'to minimize operational risks and delays',
  'marking a new milestone in the sector',
  'following rigorous testing and validation',
  'sparking significant interest among global experts',
  'designed to optimize resource allocation',
  'with focus on inclusivity and transparency',
  'representing a strategic shift in direction'
];

// Helper to generate a slug
function getSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Generate 400-500 words summary and key points
function generateSeededSummary(title, category) {
  const p1 = `This comprehensive report details the recent developments surrounding "${title}", an event of significant importance in the ${category} sector. The situation has sparked intense interest from industry analysts, policymakers, and the general public, highlighting critical shifts in the current landscape. Initial statements from authorities indicate that all operations are proceeding under strict regulatory supervision, with a primary focus on safety, transparency, and public interest. As this event unfolds, stakeholders are carefully analyzing the immediate impact on local and international markets.`;

  const p2 = `Following the initial announcement, a series of evaluations were conducted to verify the technical and operational details. Industry experts have noted that the integration of modern protocols has greatly mitigated potential risks. Key personnel from verified agencies have issued official responses, confirming that the initial timelines remain intact. Meanwhile, community leaders and advocacy groups have expressed their perspectives, emphasizing the need for continuous oversight and clear communication channels to maintain public trust throughout this transition period.`;

  const p3 = `To ensure the utmost accuracy and filter out potential single-source bias, our editorial team cross-referenced this story across 12 independent media outlets and verified the key metrics. The consensus indicates that while the primary objectives have been successfully achieved, some long-term projection details are not confirmed yet. Analysts suggest that the initial success of this implementation will pave the way for similar updates in neighboring sectors. The confidence index for this reporting is high, supported by corroborated data points and peer-reviewed safety assessments.`;

  const p4 = `Looking forward, the strategic implications of "${title}" are expected to influence policy decisions in the coming months. Regulatory bodies are currently drafting updated compliance guidelines to accommodate these changes. A final review is scheduled for the end of the current quarter, at which point a more comprehensive public disclosure will be made. For now, observers are advised to rely strictly on verified channels, as several unconfirmed reports continue to circulate in unauthorized media forums. Details not confirmed yet will be added as they are verified.`;

  const summary = `${p1}\n\n${p2}\n\n${p3}\n\n${p4}`;

  const keyPoints = [
    `The event centers on "${title}", originally documented under strict verification standards.`,
    `A series of independent evaluations confirmed that modern protocols successfully mitigated major operational risks.`,
    `Our AI cross-referenced reports from 12 separate sources, verifying a high confidence index and consensus.`,
    `Stakeholders and regulatory bodies are drafting updated compliance guidelines to govern future implementations.`,
    `Certain long-term projections remain tentative, with official details not confirmed yet pending final quarterly review.`
  ];

  return { summary, keyPoints };
}

// Generate translations in the seed script
function generateSeededTranslations(title, category) {
  return {
    te: `"${title}" కు సంబంధించి ప్రచురించబడిన నిവേదికల ఆధారంగా ఈ సమగ్ర సమాచారం సేకరించబడింది. ఈ పరిణామం మొదట నివేదించబడింది, ఇది సమాజంలో మరియు పరిశ్రమ వర్గాలలో విస్తృత ఆసక్తిని రేకెత్తించింది. ప్రారంభ నివేదికల ప్రకారం, భద్రత, పారదర్శకత మరియు ప్రజా ప్రయోజనాలకు అత్యంత ప్రాధాన్యత ఇస్తూ ఈ ప్రక్రియ నిర్వహించబడుతోంది. సంబంధిత నిపుణులు ఈ పరిణామాల తక్షణ ప్రభావాలపై క్షుణ్ణంగా పరిశోధనలు చేస్తున్నారు.\n\nమొదటి ప్రకటన వెలువడిన తర్వాత, సాంకేతిక మరియు నిర్వహణ వివరాలను సరిచూడడానికి వరుసగా పరీక్షలు జరిగాయి. ఆధునిక పద్ధతులను ఉపయోగించడం వల్ల తలెత్తే ఇబ్బందులను చాలా వరకు నివారించవచ్చని నిపుణులు అభిప్రాయపడ్డారు. అధికారుల నుండి అధికారిక ప్రకటనలు వెలువడ్డాయి, ఈ ప్రక్రియ నిర్ణీత గడువులోనే పూర్తవుతుందని వారు ధృవీకరించారు.\n\nసమాచార ఖచ్చితత్వాన్ని నిర్ధారించడానికి మరియు ఏకపక్ష నివేదికలను నిరోధించడానికి మా బృందం ఈ వార్తను 12 వేర్వేరు స్వతంత్ర వార్తా సంస్థల నివేదికలతో సరిపోల్చి చూసింది. ప్రధాన లక్ష్యాలు నెరവേరినప్పటికీ, దీర్ఘకాలిక ప్రభావాలకు సంబంధించిన కొన్ని వివరాలు ఇంకా ధృవీకరించబడలేదు. నిపుణుల అభిప్రాయం ప్రకారం, ఈ విజయవంతమైన అమలు త్వరలోనే ఇతర రంగాలలో కూడా ఇలాంటి మార్పులకు దారితీస్తుంది.\n\nభವಿష్యత్తును దృష్టిలో ఉంచుకుంటే, "${title}" యొక్క వ్యూహాత్మక మార్పులు రాబోయే నెలల్లో కీలక విధాన నిర్ణయాలను ప్రభావితం చేయనున్నాయి. నియంత్రణ సంస్థలు ప్రస్తుతం ఈ మార్పులకు అనుగుణంగా నూతన మార్గదర్శకాలను రూపొందిస్తున్నాయి. ఈ త్రైమాసికం చివరలో తుది సమీక్ష నిర్వహించబడుతుంది. అప్పటివరకు అధికారిక సమాచారాన్ని మాత్రమే నమ్మవలసిందిగా ప్రజలకు విజ్ఞప్తి చేయడమైనది.`,
    
    hi: `यह विस्तृत रिपोर्ट "${title}" के संबंध में है, जिसे पहली बार प्रकाशित किया गया था। इस घटनाक्रम ने उद्योग विश्लेषकों और आम जनता के बीच महत्वपूर्ण उत्सुकता पैदा की है। अधिकारियों के शुरुआती बयानों से संकेत मिलता है कि सभी गतिविधियां सख्त विनियामक निगरानी में चल रही हैं, जिसमें सुरक्षा, पारदर्शिता और सार्वजनिक हित को प्राथमिकता दी गई है।\n\nप्रारंभिक घोषणा के बाद, परिचालन विवरणों को सत्यापित करने के लिए मूल्यांकन की एक श्रृंखला आयोजित की गई। विशेषज्ञों का मानना है कि नए सुरक्षा मानकों के लागू होने से संभावित जोखिमों को काफी कम किया गया है। अधिकारियों ने पुष्टि की है कि परियोजना की समयसीमा में कोई बदलाव नहीं हुआ है।\n\nसटीकता सुनिश्चित करने के लिए हमारी संपादकीय टीम ने 12 स्वतंत्र मीडिया आउटलेट्स से इस खबर की पुष्टि की है। सभी रिपोर्टों में आम सहमति है कि मुख्य उद्देश्यों को सफलतापूर्वक प्राप्त कर लिया गया है, हालांकि मुख्य रिपोर्टों के कुछ विवरणों की पुष्टि होना अभी बाकी है। इस रिपोर्ट का विश्वसनीयता सूचकांक बहुत अधिक है।\n\nभविष्य की बात करें तो, "${title}" का व्यापक प्रभाव आने वाले महीनों में नीतिगत निर्णयों पर दिखाई देगा। नियामक निकाय वर्तमान में इन बदलावों के अनुरूप नए दिशानिर्देशों का मसौदा तैयार कर रहे हैं। इस तिमाही के अंत में एक अंतिम समीक्षा की जाएगी, जिसके बाद विस्तृत सार्वजनिक खुलासा किया जाएगा।`,

    ta: `"${title}" தொடர்பான செய்திகளின் தொகுப்பு இதுவாகும், இது முதன்முதலில் வெளியிடப்பட்டது. இந்த நிகழ்வு வணிக வல்லுநர்கள் மற்றும் பொதுமக்களிடையே பெரும் எதிர்பார்ப்பை ஏற்படுத்தியுள்ளது. ஆரம்பகட்ட தகவலின்படி, பாதுகாப்பு மற்றும் வெளிப்படைத்தன்மைக்கு முக்கியத்துவம் அளிக்கப்பட்டு இந்த நடவடிக்கைகள் மேற்கொள்ளப்பட்டு வருகின்றன. தற்போதைய நிலவரப்படி, அதிகாரிகள் இதன் தற்காலிக விளைவுகளை ஆராய்ந்து வருகின்றனர்.\n\nசெய்தி வெளியானதைத் தொடர்ந்து, தொழில்நுட்ப விவரங்களை சரிபார்க்கும் பணிகள் தொடங்கப்பட்டன. புதிய பாதுகாப்பு விதிமுறைகளை அமல்படுத்தியதன் மூலம் சாத்தியமான ஆபத்துகள் பெருமளவில் குறைக்கப்பட்டுள்ளதாக நிபுணர்கள் தெரிவித்துள்ளனர். திட்டமிடப்பட்ட காலக்கெடுவுக்குள் பணிகள் நிறைவடையும் என்று அதிகாரிகள் உறுதிப்படுத்தியுள்ளனர்.\n\nசெய்தியின் நம்பகத்தன்மையை உறுதி செய்வதற்காக, எங்களது செய்திக்குழு 12 க்கும் மேற்பட்ட ஊடகங்களின் செய்திகளை ஒப்பிட்டு ஆராய்ந்தது. அனைத்து செய்திகளிலும் பொதுவான ஒருமித்த கருத்து காணப்படுகிறது. இருப்பினும், நீண்டகால விளைவுகள் குறித்த சில விவரங்கள் இன்னும் முழுமையாக உறுதிப்படுத்தப்படவில்லை. கூடுதல் தரவுகள் பெறப்பட்ட பின்னர் இந்த விவரங்கள் அறிவிக்கப்படும்.\n\nஎதிர்காலத்தை கருத்தில் கொண்டு, "${title}" நிகழ்வின் தாக்கம் அடுத்த சில மாதங்களில் முக்கிய கொள்கை முடிவுகளில் எதிரொலிக்கும். தற்போதைய மாற்றங்களுக்கு ஏற்ப புதிய வழிகாட்டுதல்களை அதிகாரிகள் தயாரித்து வருகின்றனர். இந்த காലാண்டின் இறுதியில் இறுதி ஆய்வு கூட்டம் நடைபெறவுள்ளது.`,

    kn: `"${title}" ಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ ಲಭ್ಯವಿರುವ ಪ್ರಮುಖ ವಿವರಗಳನ್ನು ಈ ವರದಿಯು ಒಳಗೊಂಡಿದೆ. ಈ ಸುದ್ದಿ ಸಾರ್ವಜನಿಕರಲ್ಲಿ ಮತ್ತು ಕೈಗಾರಿಕಾ ವಲಯದಲ್ಲಿ ತೀವ್ರ ಆಸಕ್ತಿಯನ್ನು ಕೆರಳಿಸಿದೆ. ಆರಂಭಿಕ ಮಾಹಿತಿಯ ಪ್ರಕಾರ, ಸುರಕ್ಷತೆ ಮತ್ತು ಪಾರದರ್ಶಕತೆಗೆ ಹೆಚ್ಚಿನ ಆದ್ಯತೆ ನೀಡಿ ಈ ಸಂಪೂರ್ಣ ಪ್ರಕ್ರಿಯೆಯನ್ನು ನಡೆಸಲಾಗುತ್ತಿದೆ. ತಜ್ಞರ ತಂಡವು ಇದರ ಪ್ರಭಾವಗಳನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಗಮನಿಸುತ್ತಿದೆ.\n\nಮೊದಲ ಪ್ರಕಟಣೆಯ ನಂತರ, ತಾಂತ್ರಿಕ ಮತ್ತು ಕಾರ್ಯಾಚರಣೆಯ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ಸರಣಿ ಪರೀಕ್ಷೆಗಳನ್ನು ನಡೆಸಲಾಯಿತು. ಆಧುನಿಕ ಪದ್ಧತಿಗಳ ಅಳವಡಿಕೆಯಿಂದ ಸಂಭಾವ್ಯ ಅಪಾಯಗಳು ದೂರವಾಗಿವೆ ಎಂದು ವಿಶ್ಲೇಷಕರು ಅಭಿಪ್ರಾಯಪಟ್ಟಿದ್ದಾರೆ. ನಿಯೋಜಿತ ಸಮಯದೊಳಗೆ ಕಾರ್ಯಗಳು ಪೂರ್ಣಗೊಳ್ಳಲಿವೆ ಎಂದು ಅಧಿಕಾರಿಗಳು ದೃಢಪಡಿಸಿದ್ದಾರೆ.\n\nವರದಿಯ ನಿಖರತೆಯನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಲು ನಮ್ಮ ತಂಡವು 12 ಕ್ಕೂ ಹೆಚ್ಚು ಸ್ವತಂತ್ರ ಮಾಧ್ಯಮಗಳ ಸುದ್ದಿಗಳೊಂದಿಗೆ ಈ ವರದಿಯನ್ನು ತಾಳೆ ಮಾಡಿದೆ. ಮುಖ್ಯ ಉದ್ದೇಶಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸಾಧಿಸಲಾಗಿದ್ದರೂ, ದೀರ್ಘಾವಧಿಯ ಪರಿಣಾಮಗಳ ಕೆಲವು ವಿವರಗಳು ಇನ್ನೂ ದೃಢಪಟ್ಟಿಲ್ಲ. ಹೆಚ್ಚಿನ ಸಂಶೋಧನೆಯ ನಂತರ ಈ ವಿವರಗಳನ್ನು ಬಿಡುಗಡೆ ಮಾಡಲಾಗುವುದು.\n\nಭವಿಷ್ಯದ ದೃಷ್ಟಿಯಿಂದ, "${title}" ನ ಮಹತ್ವದ ಬದಲಾವಣೆಗಳು ಮುಂಬರುವ ತಿಂಗಳುಗಳಲ್ಲಿ ನೀತಿ ನಿರ್ಧಾರಗಳ ಮೇಲೆ ಪ್ರಭಾವ ಬೀರಲಿವೆ. ನಿಯಂತ್ರಣ ಮಂಡಳಿಗಳು ಹೊಸ ಮಾರ್ಗಸೂಚಿಗಳನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತಿವೆ. ಈ ತ್ರೈಮಾಸಿಕದ ಕೊನೆಯಲ್ಲಿ ಅಂತಿಮ ಪರಿಶೀಲನಾ ಸಭೆ ನಡೆಯಲಿದ್ದು, ನಂತರ ಪೂರ್ಣ ವಿವರಗಳನ್ನು ಬಹಿರಂಗಪಡಿಸಲಾಗುವುದು.`,

    ml: `"${title}" എന്ന വിഷയത്തിൽ ലഭ്യമായ ഏറ്റവും പുതിയ വിവരങ്ങൾ അടങ്ങിയതാണ് ഈ സമഗ്ര റിപ്പോർട്ട്. ഈ സംഭവം വ്യവസായ രംഗത്തും പൊതുജനങ്ങൾക്കിടയിലും വലിയ താൽപ്പര്യം ജനിപ്പിച്ചിട്ടുണ്ട്. പ്രാരംഭ വിവരങ്ങൾ അനുസരിച്ച്, സുരക്ഷയ്ക്കും സുതാര്യതയ്ക്കും മുൻഗണന നൽകിയാണ് എല്ലാ നടപടികളും പുരോഗമിക്കുന്നത്. ബന്ധപ്പെട്ട അധികാരികൾ ഇതിന്റെ തത്സമയ വിലയിരുത്തലുകൾ നടത്തുന്നു.\n\nആദ്യ അറിയിപ്പ് വന്നതിന് പിന്നാലെ സാങ്കേതിക വിശദാംശങ്ങൾ പരിശോധിക്കുന്നതിനുള്ള നടപടികൾ ആരംഭിച്ചു. ആധുനിക സുരക്ഷാ സംവിധാനങ്ങൾ ഏർപ്പെടുത്തിയതു വഴി അപകടസാധ്യതകൾ ഗണ്യമായി കുറയ്ക്കാൻ കഴിഞ്ഞതായി വിദഗ്ധർ ചൂണ്ടിക്കാണിക്കുന്നു. പ്രവർത്തനങ്ങൾ നിശ്ചിത സമയത്തിനുള്ളിൽ തന്നെ പൂർത്തിയാകുമെന്ന് അധികൃതർ ഉറപ്പുനൽകി.\n\nവാർത്തയുടെ കൃത്യത ഉറപ്പാക്കുന്നതിനായി ഞങ്ങളുടെ എഡിറ്റോറിയൽ വിഭാഗം 12-ലധികം സ്വതന്ത്ര വാർത്താ മാധ്യമങ്ങളുടെ റിപ്പോർട്ടുകൾ പരിശോധിച്ചു. പ്രധാന ലക്ഷ്യങ്ങളെല്ലാം കൈവരിക്കാൻ കഴിഞ്ഞിട്ടുണ്ടെങ്കിലും ചില ദീർഘകാല പ്രവചനങ്ങളുടെ വിശദാംശങ്ങൾ ഇതുവരെ സ്ഥിരീകരിച്ചിട്ടില്ല. ഈ വാർത്തയ്ക്ക് വളരെ ഉയർന്ന വിശ്വസനീയതയാണ് ഉള്ളത്.\n\nഭാവിയിൽ, "${title}" വരുത്തുന്ന മാറ്റങ്ങൾ വരും മാസങ്ങളിലെ നയപരമായ തീരുമാനങ്ങളെ സ്വാധീനിച്ചേക്കാം. നിയന്ത്രണ ബോർഡുകൾ ഇതിനകം തന്നെ പുതിയ നിർദ്ദേശങ്ങൾ തയ്യാറാക്കാൻ തുടങ്ങിയിട്ടുണ്ട്. ഈ പാദത്തിന്റെ അവസാനം നടക്കുന്ന അവലോകന യോഗത്തിന് ശേഷം കൂടുതൽ വിവരങ്ങൾ ഔദ്യോഗികമായി പുറത്തുവിടും.`
  };
}

function getSubjectKeyword(subject, category) {
  const mapping = {
    'Quantum Computing': 'quantum,computer',
    'Artificial Intelligence': 'ai,robot',
    'Cybersecurity Protocols': 'cybersecurity,hacking',
    'Semiconductor Chips': 'microchip,semiconductor',
    'Cloud Frameworks': 'server,cloud',
    'Autonomous Vehicles': 'self-driving,car',
    'Edge Computing': 'network,servers',
    'Green Energy Grids': 'solar,wind,energy',
    'Biometric Sensors': 'biometric,sensor',
    'Augmented Reality': 'virtual,reality,glasses',
    
    'Championship Tournament': 'stadium,trophy',
    'Olympic Selection Committee': 'olympics,athletics',
    'Athletic Association': 'running,track',
    'Football League': 'soccer,ball',
    'Cricket Board': 'cricket,stadium',
    'Tennis Association': 'tennis,court',
    'Formula One Grand Prix': 'race,car',
    'Basketball Finals': 'basketball,hoop',
    'World Swimming Cup': 'swimming,pool',
    'Gymnastics Federation': 'gymnastics',
    
    'Primary School Curriculums': 'classroom,school',
    'University Consortia': 'university,campus',
    'Vocational Training Programs': 'vocational,workshop',
    'Online Learning Platforms': 'e-learning,laptop',
    'Literacy Campaigns': 'books,reading',
    'Double Degree Programs': 'graduation,students',
    'Scientific Research Fellowships': 'science,laboratory',
    'Coding Bootcamps': 'coding,programming',
    'STEM Interactive Kits': 'child,learning,science',
    'Language Immersion Centers': 'language,classroom',
    
    'Cardiovascular Health Study': 'heart,fitness',
    'Mental Health Coalition': 'meditation,calm',
    'Workspace Ergonomics Forum': 'office,chair,ergonomic',
    'Mens Lifestyle Trends': 'men,fashion,lifestyle',
    'Nutrition and Metabolism Research': 'healthy,food,nutrition',
    'Fitness Training Methods': 'gym,workout',
    'Stress Management Framework': 'yoga,meditation',
    'Preventive Care Guidelines': 'medical,checkup',
    'Executive Leadership Development': 'business,meeting',
    'Community Mentorship Initiatives': 'mentorship,community',
    
    'Entrepreneurship Grants': 'business,startup',
    'Corporate Leadership Summit': 'business,woman,presentation',
    'Maternity Health Networks': 'mother,baby,pregnancy',
    'Womens Rights Coalition': 'women,protest,rights',
    'Clean Tech Startup Awards': 'green,technology,awards',
    'Professional Leagues Expansion': 'women,sports,soccer',
    'Scientific Research Awards': 'woman,scientist,laboratory',
    'Mentorship and Funding Programs': 'mentorship,business',
    'Equal Pay Initiatives': 'equality,corporate',
    'Wellness and Nutrition Studies': 'healthy,woman,salad',
    
    'Early Childhood Care Grants': 'toddler,playground',
    'Pediatric Sleep Guidelines': 'child,sleeping,bed',
    'Interactive STEAM Science Kits': 'kids,science,experiment',
    'National Child Welfare Policies': 'children,happy',
    'Urban Playground Initiatives': 'kids,playground',
    'Screentime and Development Reports': 'child,tablet,screen',
    'Literacy and Language Milestones': 'child,reading,book',
    'Nutritional Support Programs': 'school,lunch,child',
    'Creative Art Workshops': 'child,painting,art',
    'Safety and Protection Services': 'child,parenting,safety',
    
    'Express Train Derailment': 'train,tracks,accident',
    'Highway Cargo Transport Collision': 'truck,accident,highway',
    'Industrial Chemical Storage Fire': 'industrial,fire,smoke',
    'Coastal Storm Marine Alert': 'storm,ocean,waves',
    'City Building Scaffold Collapse': 'construction,hazard,safety',
    'Subway System Power Interruption': 'subway,darkness,transit',
    'Warehouse Facility Structural Hazard': 'warehouse,safety,hazard',
    'Mountain Highway Landslide': 'landslide,mountain,road',
    'Commercial Port Docking Incident': 'port,ship,accident',
    'Aviation Safety Investigation': 'airplane,safety,investigation',
    
    'Vizag Beach Cleaning Drive': 'beach,cleanup,trash',
    'Visakhapatnam Metropolitan Authority': 'city,skyline,india',
    'Vizag Smart Port Project': 'shipping,port,cranes',
    'Andhra Pradesh Electric Bus Fleet': 'electric,bus,transport',
    'Visakhapatnam IT Park Expansion': 'office,building,modern',
    'Vizag Fishery Harbor Modernization': 'harbor,boats,fishing',
    'Andhra Pradesh Clean Water Initiative': 'clean,water,tap',
    'Vizag Urban Housing Development': 'apartment,building,construction',
    'Visakhapatnam Metro Rail Feasibility': 'metro,train,station',
    'Vizag Tourism Expansion Plans': 'beach,tourism,resort',
    
    'National Expressway Expansion Project': 'highway,road,construction',
    'Central Bank Digital Currency Phase Two': 'digital,currency,bitcoin',
    'Forest Boundary Conservation Registry': 'forest,trees,conservation',
    'National Smart Grid Deployment': 'power,lines,grid',
    'Rural Electrification Milestone': 'rural,electricity,light',
    'High-Speed Railway Corridor Launch': 'bullet,train,railway',
    'National Health Insurance Database': 'health,insurance,card',
    'Agricultural Subsidies Framework': 'agriculture,farmer,tractors',
    'Defense Sector Modernization Program': 'military,defense,soldier',
    'Clean Energy Storage Facilities': 'battery,storage,solar',
    
    'Global Trade Compliance Standards': 'trade,cargo,containers',
    'International Space Station Solar Array': 'space,station,iss',
    'UN Oceanic Wildlife Conservation': 'ocean,fish,conservation',
    'World Tourism Traffic Projection': 'airport,traveler,plane',
    'Global Carbon Offsetting Treaties': 'climate,change,forest',
    'International Cyber-Defense Alliance': 'cyber,security,network',
    'Global Food Security Initiatives': 'food,grain,distribution',
    'World Monetary Fund Interest Rates': 'money,bank,finance',
    'Cross-Border Renewable Energy Pipelines': 'pipeline,wind,turbines',
    'Global Intellectual Property Treaties': 'patent,document,law',
    
    'Fintech Startup Capital Funding': 'fintech,business,finance',
    'Retail Conglomerate Biodegradable Packaging': 'biodegradable,packaging,box',
    'Real Estate Investment Trust Yields': 'skyline,real-estate,investment',
    'Commercial Drone Delivery Launch': 'delivery,drone,flight',
    'Global Supply Chain Optimization': 'warehouse,logistics,cargo',
    'E-commerce Automation Integration': 'ecommerce,warehouse,robot',
    'Venture Capital Tech Investment': 'investor,presentation,startup',
    'Commercial Banking Liquidity Assets': 'bank,vault,cash',
    'Renewable Energy Project Mergers': 'wind,solar,business',
    'Consumer Retail Market Survey': 'retail,shopping,mall',
    
    'Clinical Trial Cardiovascular Drug': 'cardiology,pills,medical',
    'Global Wellness Alliance Ergonomics': 'ergonomic,office,chair',
    'Rural Telemedicine Consultation Platforms': 'telemedicine,doctor,laptop',
    'Nutrition Coalition Sugar Reduction': 'sugar,sweet,nutrition',
    'Immunology Research Lab Discovery': 'scientist,microscope,laboratory',
    'Preventive Health Checkup Protocols': 'doctor,checkup,health',
    'Mental Health Counseling Access': 'therapy,counseling,mental',
    'Oncology Research Equipment Grant': 'cancer,research,microscope',
    'Diabetes Management Smart Devices': 'diabetes,glucose,monitor',
    'Clean Drinking Water Health Impact': 'clean,water,drinking',
    
    'Technology Sector Cybersecurity Hiring': 'interview,cybersecurity',
    'Green Infrastructure Construction Careers': 'green,building,construction',
    'Regional Technical Jobs Fair': 'job,fair,applicants',
    'Remote Workspace Flexible Standards': 'remote,work,laptop,home',
    'AI Integration Workforce Retraining': 'classroom,training,learning',
    'Vocational Apprenticeship Growth': 'apprentice,mechanic,workshop',
    'Healthcare Staffing Shortage Solutions': 'nurse,hospital,hiring',
    'Gig Economy Worker Protections': 'delivery,driver,courier',
    'Corporate Diversity Hiring Metrics': 'office,diversity,meeting',
    'Creative Industry Freelance Platforms': 'designer,freelance,artist',
    
    'Independent Film Festival Awards': 'cinema,director,awards',
    'Live Orchestra Audio Modulation': 'orchestra,concert,violin',
    'Annual Theater Writing Grants': 'theater,stage,script',
    'Streaming Platform Historical Adaptations': 'television,actors,period',
    'International Art Exhibition Curations': 'art,gallery,museum',
    'Museum Virtual Gallery Tours': 'museum,exhibition,art',
    'Music Production Software Standards': 'music,studio,recording',
    'Regional Dance Festival Showcases': 'dance,performer,stage',
    'Popular Culture Convention Returns': 'comic,convention,fans',
    'Historical Fiction Literary Awards': 'books,trophy,literature',
    
    'Electoral Commission Voting Machine': 'election',
    'Municipal Citizen Budget Committees': 'townhall',
    'Parliament Environmental Protection Acts': 'parliament',
    'Public Utility Pricing Reform Proposals': 'infrastructure',
    'National Security Advisory Committee': 'briefing',
    'Local Government Transparency Portal': 'government',
    'Regional Trade Agreement Debates': 'diplomacy',
    'Urban Infrastructure Funding Approvals': 'construction',
    'Education Funding Policy Review': 'classroom',
    'Agricultural Land Zoning Reforms': 'farmland',
    
    'Exoplanet Atmosphere Deep-Space Images': 'nebula,galaxy,telescope',
    'Ocean Trench Deep Sea Species Discovery': 'deepsea,submarine,fish',
    'Super-Light Carbon Graphene Synthesis': 'carbon,graphene,nanotechnology',
    'Arid Region Aquifer Mapping': 'desert,water,mapping',
    'Geothermal Heat Energy Drilling': 'geothermal,drilling,energy',
    'Superconducting Material Experiments': 'laboratory,superconductor,cold',
    'Quantum Chemistry Molecule Modeling': 'molecule,model,chemistry',
    'Paleontological Fossil Excavation': 'dinosaur,fossil,archaeology',
    'Atmospheric Carbon capture Trials': 'carbon,capture,factory',
    'Genomic Sequencing Diversity Studies': 'dna,genome,sequencing'
  };
  
  return mapping[subject] || category.toLowerCase();
}

const seedPosts = [];

for (let c = 0; c < CATEGORIES.length; c++) {
  const category = CATEGORIES[c];
  
  for (let i = 0; i < 50; i++) {
    const subjectsList = SUBJECTS[category] || ['Operational Development', 'Key Project Initiative', 'New Standards Framework'];
    const subject = subjectsList[i % subjectsList.length];
    const action = ACTIONS[(i * 3 + 1) % ACTIONS.length];
    const modifier = MODIFIERS[(i * 7 + 3) % MODIFIERS.length];
    
    let title = `${subject} ${action} ${modifier}`;
    if (category === 'Local') {
      title = `${subject} in Vizag ${action} ${modifier}`;
    }

    const slug = getSlug(title) + '-' + Math.random().toString(36).substring(2, 6);
    const source = TRUSTED_SOURCES[(c * 50 + i) % TRUSTED_SOURCES.length];
    
    // Get unique and highly relevant image URL using getPremiumImage helper
    const customKeyword = getSubjectKeyword(subject, category);
    const imgInfo = getPremiumImage(category, i, customKeyword);

    const { summary, keyPoints } = generateSeededSummary(title, category);
    const translatedSummary = generateSeededTranslations(title, category);

    const post = {
      title,
      slug,
      summary,
      keyPoints,
      category,
      tags: [category.toLowerCase(), 'verified', 'news', 'update', 'deepsummary'],
      genre: 'News Report',
      language: 'en',
      translatedSummary,
      location: category === 'Local' ? 'local' : (category === 'International' ? 'international' : 'national'),
      city: category === 'Local' ? 'Vizag' : null,
      state: category === 'Local' ? 'Andhra Pradesh' : null,
      country: 'India',
      imageUrl: imgInfo.url,
      imageSource: imgInfo.source,
      imageLicense: imgInfo.license,
      sourceName: source.name,
      sourceUrl: source.url,
      publishedAt: new Date(Date.now() - ((c * 50 + i) * 15 * 60000)), // spaced by 15 mins
      fetchedAt: new Date(Date.now() - ((c * 50 + i) * 15 * 60000) + 5000),
      status: (c * 50 + i) < 780 ? 'approved' : 'pending', // 780 approved, 20 pending for dashboard review
      confidenceScore: 80 + ((c * 50 + i) % 21),
      verificationSources: [
        source.url,
        `https://www.bbc.co.uk/search?q=${encodeURIComponent(category)}`,
        `https://www.reuters.com/search/news?blob=${encodeURIComponent(category)}`,
        `https://www.bloomberg.com/search?query=${encodeURIComponent(category)}`
      ],
      isDuplicate: false,
    };

    seedPosts.push(post);
  }
}

async function seed() {
  console.log('Connecting to database:', MONGODB_URI);
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // 1. Seed Categories
    console.log('Clearing old categories...');
    await Category.deleteMany({});
    const categoryDocs = CATEGORIES.map(name => ({
      name,
      slug: name.toLowerCase()
    }));
    await Category.insertMany(categoryDocs);
    console.log(`Seeded ${categoryDocs.length} categories.`);

    // 2. Seed Sources
    console.log('Clearing old sources...');
    await Source.deleteMany({});
    await Source.insertMany(TRUSTED_SOURCES);
    console.log('Seeded trusted sources.');

    // 3. Seed News Posts
    console.log('Clearing old news posts...');
    await NewsPost.deleteMany({});
    
    // Chunk insert to avoid document limit payload exceptions in Mongoose
    const chunkSize = 100;
    for (let i = 0; i < seedPosts.length; i += chunkSize) {
      const chunk = seedPosts.slice(i, i + chunkSize);
      await NewsPost.insertMany(chunk);
      console.log(`Seeded chunk ${Math.floor(i / chunkSize) + 1} (${chunk.length} posts)...`);
    }
    
    console.log(`Seeded ${seedPosts.length} news posts successfully!`);

    // 4. Create an Admin User in DB
    console.log('Clearing old admin users...');
    await AdminUser.deleteMany({});
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new AdminUser({
      username: 'admin',
      password: hashedPassword
    });
    await admin.save();
    console.log('Seeded admin user credentials (admin / admin123).');

    console.log('Database Seeding Completed Successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
}

seed();
