const PREMIUM_IMAGES = {
  Technology: [
    'photo-1518770660439-4636190af475', // Circuit board macro
    'photo-1488590528505-98d2b5aba04b', // Developer workspace laptop
    'photo-1531297484001-80022131f5a1', // Modern laptop close-up
    'photo-1485827404703-89b55fcc595e'  // Industrial robotics arm
  ],
  Sports: [
    'photo-1508098682722-e99c43a406b2', // Soccer ball on pitch
    'photo-1517649763962-0c623066013b', // Track running athletes
    'photo-1541252260730-0412e8e2108e', // Cricket field wicket
    'photo-1461896836934-ffe607ba8211'  // Athlete starting sprint
  ],
  Education: [
    'photo-1427504494785-3a9ca7044f45', // Library desks study hall
    'photo-1456513080510-7bf3a84b82f8', // Books piled up study
    'photo-1503676260728-1c00da094a0b', // Classroom chalkboard teacher
    'photo-1523050854058-8df90110c9f1'  // Graduation hats university
  ],
  Men: [
    'photo-1492562080023-ab3db95bfbce', // Professional man outdoor
    'photo-1506794778202-cad84cf45f1d', // Stylish man portrait
    'photo-1489980508314-941910ded1f4', // Male clothing fashion line
    'photo-1500648767791-00dcc994a43e'  // Smiling man portrait
  ],
  Women: [
    'photo-1573496359142-b8d87734a5a2', // Professional woman executive
    'photo-1508214751196-bcfd4ca60f91', // Happy woman smiling outdoor
    'photo-1494790108377-be9c29b29330', // Elegant woman studio portrait
    'photo-1534528741775-53994a69daeb'  // Smiling female student
  ],
  Children: [
    'photo-1485546246426-74dc88dec4d9', // Kid drawing coloring book
    'photo-1502086223501-7ea6ecd79368', // Children running in grass
    'photo-1516627145497-ae6968895b74', // Toddler playing smiling
    'photo-1503919545889-aef636e10ad4'  // School kids playing outdoors
  ],
  Accidents: [
    'photo-1474487548417-781cb71495f3', // Train tracks safety
    'photo-1616788494707-ec28f08d05a1', // Warning collision warning light
    'photo-1594913785162-e6785b68cee3', // Safety hazard tape stripe
    'photo-1563201372-268249974026'  // Red fire truck strobe lights
  ],
  Local: [
    'photo-1596402184320-417e7178b2cd', // Vizag beach ocean dock
    'photo-1507525428034-b723cf961d3e', // Sandy beach water sunset
    'photo-1544735716-392fe2489ffa', // Gateway of India landmark
    'photo-1561361513-2d000a50f0db'  // Indian auto rickshaw traffic
  ],
  National: [
    'photo-1541872703-74c5e44368f9', // National capital building dome
    'photo-1598977123418-45f04b6141bc', // Indian Flag hoisting monument
    'photo-1589308078059-be1415eab4c3', // Himalayas mountain range
    'photo-1506973035872-a4ec16b8e8d9'  // Parliament building monument
  ],
  International: [
    'photo-1541535881962-e62746544a87', // United Nations headquarters flags
    'photo-1488646953014-85cb44e25828', // World globe model with map
    'photo-1526304640581-d334cdbbf45e', // Global currency bills layout
    'photo-1590283603385-17ffb3a7f29f'  // Cargo plane at airport terminal
  ],
  Business: [
    'photo-1460925895917-afdab827c52f', // Financial graphs screen analysis
    'photo-1454165804606-c3d57bc86b40', // Corporate boardroom meeting
    'photo-1519085360753-af0119f7cbe7', // Executive business handshake
    'photo-1551836022-d5d88e9218df'  // Corporate teamwork discussion
  ],
  Health: [
    'photo-1505751172876-fa1923c5c528', // Doctor clinical stethoscope
    'photo-1506126613408-eca07ce68773', // Yoga wellness peaceful meditation
    'photo-1532938911079-1b06ac7ceec7', // Laboratory analysis microscope
    'photo-1576091160550-2173dba999ef'  // Hospital nurse patient checkup
  ],
  Jobs: [
    'photo-1521737711867-e3b97375f902', // Job interview corporate boardroom
    'photo-1586528116311-ad8dd3c8310d', // Logistic center worker
    'photo-1507679799987-c73779587ccf', // Recruiter screening resumes
    'photo-1573497019940-1c28c88b4f3e'  // Office team interview
  ],
  Entertainment: [
    'photo-1514525253161-7a46d19cd819', // Concert stage crowd lights
    'photo-1489599849927-2ee91cede3ba', // Cinema theater red velvet seats
    'photo-1511671782779-c97d3d27a1d4', // Studio recording mic profile
    'photo-1517604931442-7e0c8ed2963c'  // Cinema popcorn and tickets
  ],
  Politics: [
    'photo-1540910419892-4a36d2c3266c', // Speech podium microphones
    'photo-1450133064473-71024230f91b', // Voters line ballot box
    'photo-1507537362147-987905470b18', // Politician waving at crowd
    'photo-1529107386315-e1a2ed48a620'  // Legal court gavel scale
  ],
  Science: [
    'photo-1446776811953-b23d57bd21aa', // Satellite floating in Earth orbit
    'photo-1532094349884-543bc11b234d', // Chemical laboratory beaker tube
    'photo-1532187863486-abf9d39d66e8', // Scientist looking at petri dish
    'photo-1507668077129-56e32842fceb'  // DNA double helix model render
  ]
};

/**
 * Returns a high-quality, category-related image object
 * @param {string} category 
 * @param {number} seedIndex 
 * @param {string} customKeyword 
 * @returns {object} { url, source, license }
 */
export function getPremiumImage(category, seedIndex = null, customKeyword = null) {
  const cleanCat = category && PREMIUM_IMAGES[category] ? category : 'Science';
  const list = PREMIUM_IMAGES[cleanCat];
  
  if (seedIndex !== null) {
    // If a custom keyword is provided, format it for LoremFlickr (comma-separated words)
    let keyword = cleanCat.toLowerCase();
    if (customKeyword) {
      keyword = customKeyword
        .toLowerCase()
        .replace(/[^a-z0-9,\s-]/g, '') // remove special characters
        .replace(/\s+/g, ',')           // replace spaces with commas for tag matching
        .replace(/-+/g, ',');          // replace dashes with commas
    }
    
    const lockVal = Math.abs(seedIndex) + 1;
    return {
      url: `https://loremflickr.com/800/600/${keyword}?lock=${lockVal}`,
      source: 'LoremFlickr Stock Library',
      license: 'Creative Commons / Public Domain'
    };
  }
  
  const index = Math.floor(Math.random() * list.length);
  const photoId = list[index];
  
  return {
    url: `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&q=80`,
    source: 'Unsplash Image Library',
    license: 'Free to use under the Unsplash Open License'
  };
}
