import { assetUrl } from '../assetUrl'

// Only publish supplied details and verified destinations. Contact prompts stay off.
export const PROFILE = {
  name: 'Ashwin Raghavendran',
  role: 'AI & IoT Developer',
  location: 'Coimbatore, Tamil Nadu, India',
  github: 'https://github.com/ash-labs-02',
  summary: 'I’m a Computer Science (IoT) undergraduate building across the software–hardware boundary. From embedded firmware to LLM-powered applications, I work with real-time data, on-device AI, and the systems that connect them—with a strong interest in performance engineering.',
  education: { degree: 'B.E. Computer Science and Engineering (IoT)', college: 'Sri Krishna College of Technology, Coimbatore', graduation: '2028', cgpa: '8.2 / 10' },
}

export const SKILL_GROUPS = [
  { title: 'Languages', items: ['C++', 'Python', 'JavaScript'] },
  { title: 'AI & machine learning', items: ['LLM integration', 'GPT-4 · OpenAI API', 'Gemini Nano · Edge AI', 'Prompt engineering', 'TextBlob'] },
  { title: 'Applications & data', items: ['Flask', 'React', 'Pathway', 'yFinance', 'REST API design', 'Chrome Extensions · Manifest V3'] },
  { title: 'Hardware & tools', items: ['ESP32-CAM', 'Ultrasonic & IR sensors', 'Firmware', '3D printing · PLA', 'Git', 'Docker', 'Canva · UI/UX'] },
]

export const PROJECTS = [
  {
    title: 'VacX', subtitle: 'Autonomous smart vacuum & mopping robot', category: '01 / EMBEDDED AI & ROBOTICS',
    description: 'An ESP32-CAM-powered robot that combines vacuuming and mopping, sensor-based obstacle detection, and Wi-Fi control. Built end to end—from a 3D-printed chassis to autonomous and manual firmware.',
    thumbnail: assetUrl('previews/vacx-system.svg'), accent: '#74e9e5',
    tags: ['ESP32-CAM', 'Firmware', 'Ultrasonic + IR', '3D printing'],
    recognition: 'Atomquest’25 · National semifinalist',
    source: '',
    outcome: 'A full working hardware prototype, demonstrated at Atomquest’25 and advanced to the semifinals.',
    contribution: 'Hardware design, 3D-printed PLA chassis, and autonomous + manual firmware logic.',
    highlights: [
      { title: 'Sense & navigate', text: 'Ultrasonic and IR sensors detect obstacles to support autonomous navigation on the ESP32-CAM platform.' },
      { title: 'Vacuum & mop', text: 'A centrifugal suction system and dual-brush mechanism form the hybrid cleaning system.' },
      { title: 'Two ways to control', text: 'A Wi-Fi-enabled control layer supports autonomous cleaning and manual operation.' },
    ],
    stack: ['ESP32-CAM', 'Embedded firmware', 'Ultrasonic sensors', 'IR sensors', 'Wi-Fi control', 'PLA 3D printing'],
  },
  {
    title: 'RealTime-Finance', subtitle: 'From live market data to AI-driven insights', category: '02 / REAL-TIME DATA & AI',
    description: 'A Dockerized Flask backend connecting live market data, sentiment analysis, and GPT-powered insights. Modular pipelines turn streaming inputs into stock analysis, exposed through REST APIs.',
    thumbnail: assetUrl('previews/finance-system.svg'), accent: '#ac93e8',
    tags: ['Flask', 'Pathway', 'Docker', 'yFinance', 'TextBlob'],
    recognition: 'Streaming pipelines · LLM integration',
    source: 'https://github.com/ASH-LABS-02/RealTime-Finance',
    outcome: 'A modular backend for real-time stock tracking, sentiment analysis, and AI-generated trading insights.',
    contribution: 'Dockerized Flask services, market-data and sentiment pipelines, GPT-based insight generation, and REST APIs for frontend integration.',
    highlights: [
      { title: 'Ingest the market', text: 'Pathway and yFinance support live market-data ingestion and modular streaming pipelines.' },
      { title: 'Add context', text: 'TextBlob provides sentiment analysis, while GPT-based models generate insights from the available data.' },
      { title: 'Serve the insight', text: 'A Dockerized Flask backend exposes REST APIs for frontend integration and real-time stock analysis.' },
    ],
    stack: ['Python', 'Flask', 'Docker', 'Pathway', 'yFinance', 'TextBlob', 'GPT-based models', 'REST APIs'],
  },
  {
    title: 'DepthWizard', subtitle: 'One satellite image. A world in real metres.', category: '03 / GEOSPATIAL AI & 3D',
    description: 'A single optical satellite image becomes a calibrated 3D surface in real metres. Fine-tuned depth estimation predicts building and tree heights, while evidence-based calibration anchors the model for measurement, simulation, and GIS workflows.',
    thumbnail: assetUrl('previews/depthwizard.webp'), accent: '#e9be80',
    imageAlt: 'DepthWizard live application showing the reconstructed DC Glover Park 3D surface and terrain controls',
    imageNote: 'Live application screenshot · DC Glover Park scene',
    tags: ['Depth Anything V2', 'FastAPI', 'Three.js', 'Docker', 'AWS EC2'],
    recognition: 'Built for ISRO/SAC’s SIH 2026 problem statement',
    source: '', live: 'https://13-62-80-223.sslip.io/#dc-glover-park',
    metrics: [
      { value: '1.66 m', label: 'RMSE · held-out WorldView satellite tiles' },
      { value: '60%', label: 'Lower error vs free 30 m elevation models · blind LiDAR tests' },
      { value: '0.35–10 m', label: 'Supported image resolution' },
    ],
    outcome: 'On held-out WorldView satellite tiles, the model reaches 1.66 m RMSE. On blind LiDAR tests, it produces 60% lower error than free 30 m elevation models. The Docker-containerised web app is deployed on AWS EC2.',
    contribution: 'Fine-tuned Depth Anything V2 on GAMUS aerial LiDAR and Urban 3D WorldView satellite data to predict metric building and tree heights from colour or panchromatic images. Built the calibration pipeline and the FastAPI + Three.js application.',
    highlights: [
      { title: 'Predict metric heights', text: 'Depth Anything V2 is fine-tuned on GAMUS aerial LiDAR and Urban 3D WorldView data. It predicts building and tree heights directly in metres from colour or panchromatic imagery, adapting to image resolutions from 0.35 to 10 m.' },
      { title: 'Anchor to evidence', text: 'The calibration pipeline uses the best available evidence: ground control points, known building heights, a user-supplied DEM, or automatically downloaded Copernicus GLO-30 elevation data.' },
      { title: 'Explore & export', text: 'The FastAPI and Three.js web app provides 3D flythroughs, flood and landslide simulation, change detection, and GIS exports. Docker packages the application for deployment on AWS EC2.' },
    ],
    stack: ['Depth Anything V2', 'GAMUS', 'Urban 3D · WorldView', 'Copernicus GLO-30', 'FastAPI', 'Three.js', 'Docker', 'AWS EC2'],
  },
]
