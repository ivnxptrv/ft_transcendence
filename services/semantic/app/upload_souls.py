import httpx
import asyncio

bios = [
  {
    "insider_id": "user_01",
    "text": "I specialize in organic permaculture and heirloom tomato cultivation. Heirloom plants are open-pollinated varieties passed down through generations, preserved for their superior genetic diversity and flavor rather than shelf-life. After twelve years climbing the corporate ladder in fintech, I traded my tailored suits for muddy boots and a small plot of land to focus on this traditional agriculture. I value quiet mornings, dark coffee, and finding a second act centered on ecological care rather than maximizing shareholder value."
  },
  {
    "insider_id": "user_02",
    "text": "I specialize in decentralized network architecture and containerized microservices. Decentralized systems distribute processing power and data across a peer-to-peer network, eliminating single points of failure and reducing reliance on centralized cloud monopolies. As a software engineer, I build these resilient frameworks using open-source tools. When I'm not configuring automation or troubleshooting infrastructure, I mentor student developers at local hackathons, surviving entirely on green tea and synthwave music."
  },
  {
    "insider_id": "user_03",
    "text": "I specialize in the archival translation of early medieval Eastern European manuscripts. Document preservation from this region relies on deciphering fragile parchment and understanding regional linguistic shifts over centuries. As an archivist and classical history nerd, I spent my twenties backpacking across Europe tracking down these forgotten folk stories. I prefer dusty library basements to modern offices and love spending hours debating historical trade routes and manuscript provenance."
  },
  {
    "insider_id": "user_04",
    "text": "I specialize in dystopian world-building and structural narrative design. World-building requires constructing logically sound sociopolitical systems, geography, and technologies to make a fictional future feel completely believable. By day I work as a freelance copywriter, but by night I apply these structural logic games to my sci-fi novels. I live constantly seeking a balance between absolute creative freedom and a rigid daily writing routine."
  },
  {
    "insider_id": "user_05",
    "text": "I specialize in predictive biometrics and mathematical athletic modeling. Predictive athletic modeling uses linear regressions and biometric data analysis to optimize physical endurance and prevent metabolic burnout. As a data analyst, I apply these rigorous statistical models to my own marathon training schedules and macro-nutrient intake. I operate purely on trend lines and predictable outcomes, thriving in challenges that require precise execution and logic."
  },
  {
    "insider_id": "user_06",
    "text": "I specialize in community-based pediatric public health interventions. Public health frameworks focus on proactive wellness, systemic medical access, and preventative care within vulnerable populations. Working as a pediatric nurse, my life revolves around organizing these community safeguards. I am a natural mediator who thrives in deep emotional processing, spending my weekends volunteering or analyzing the human element in psychological thrillers."
  },
  {
    "insider_id": "user_07",
    "text": "I specialize in traditional mortise-and-tenon timber joinery. Mortise-and-tenon is an ancient woodworking method that connects pieces of wood at 90-degree angles without nails or screws, relying entirely on wood friction and precise geometry. As a traditional woodworker, I value the patience required for these raw materials. I stay away from social media trends, believing that if a thing is worth making, it should be crafted to last a century."
  },
  {
    "insider_id": "user_08",
    "text": "I specialize in extremophilic microbial ecosystems. Extremophiles are microorganisms that live and thrive in environments once thought completely uninhabitable, such as deep-sea hydrothermal vents or acidic hot springs. As a laboratory researcher, I spend most of my time analyzing petri dishes to map these unique metabolic adaptations. I love scientific anomalies, experimental electronic music, and staying up until 3:00 AM chasing a random hypothesis."
  },
  {
    "insider_id": "user_09",
    "text": "I specialize in architectural minimalism and structural interior space optimization. Spatial minimalism focuses on eliminating physical clutter to enhance natural light, airflow, and psychological clarity within a built environment. Combining my skills as a yoga instructor and interior designer, I focus entirely on calm aesthetics. I own exactly 45 items of clothing and study mindfulness to design spaces that feel peaceful, light, and essential."
  },
  {
    "insider_id": "user_10",
    "text": "I specialize in rapid MVP development and early-stage growth hacking. Minimum Viable Product (MVP) development centers on building the simplest functional version of a product to validate market demand before scaling. As a serial entrepreneur who has launched multiple brands, I am a visionary storyteller who loves pitching ideas and building prototypes over a single weekend. I am energized by the initial spark of creation and love finding builders to execute it."
  },
  {
    "insider_id": "user_11",
    "text": "I specialize in corporate asset tracing and forensic financial untangling. Forensic accounting combines accounting, auditing, and investigative skills to track illicit funds and hidden assets through shell companies for complex legal battles. I treat balance sheets like a crime scene, leaving zero tolerance for sloppy math or vague explanations. Off the clock, I channel that obsessive attention to detail into baking artisan sourdough and mastering complex board games."
  },
  {
    "insider_id": "user_12",
    "text": "I specialize in investigative climate policy reporting. Environmental journalism requires parsing dense regulatory frameworks, tracking corporate emissions data, and filing Freedom of Information Act requests to expose eco-fraud. Armed with cold brew and public records, I work to hold institutional power accountable. I’m comfortable living out of a suitcase embedded in remote communities, though I struggle to turn off the reporter brain at home."
  },
  {
    "insider_id": "user_13",
    "text": "I specialize in urban rewilding and native rooftop ecosystems. Urban rewilding introduces native flora back into city landscapes to mitigate heat islands, manage stormwater runoff, and boost insect biodiversity. As a landscape architect, I design public spaces that blend modern infrastructure with these vital green networks. I love birdwatching, sketching in transit, and advocating for the psychological benefits of public green spaces."
  },
  {
    "insider_id": "user_14",
    "text": "I specialize in subatomic quantum entanglement modeling. Quantum entanglement occurs when pairs of particles remain connected such that actions performed on one affect the other, regardless of distance, challenging classical physics. As a theoretical physicist, I spend forty hours a week calculating these abstract mathematical states. To unwind, I value intellectual humility and head home to play low-stakes, cozy farming simulators."
  },
  {
    "insider_id": "user_15",
    "text": "I specialize in community food security systems and scale-baking. Food security initiatives focus on providing equitable, reliable access to nutritious meals within underserved neighborhoods to combat urban food deserts. I walked away from the high-stress world of Michelin-starred kitchens to open a community soup kitchen and bakery centered on this model. I run on adrenaline, old-school hip-hop, and the belief that shared meals are the ultimate equalizer."
  },
  {
    "insider_id": "user_16",
    "text": "I specialize in tungsten inert gas (TIG) aerospace welding for titanium alloys. Aerospace welding requires flawless, ultra-precise welds that can withstand extreme atmospheric pressure, high heat, and vibrational stress without cracking. My daily job requires absolute focus under a hood working with rocket components. Outside the engineering workshop, I’m a competitive powerlifter and a collector of vintage comic books."
  },
  {
    "insider_id": "user_17",
    "text": "I specialize in ensemble theater devising and youth performance pedagogy. Devised theater is a collaborative playwriting method where the script originates from improvisational exercises and collective ensemble work rather than a pre-written text. As a high school drama teacher, I use this approach to guide emotional expression in teenagers. I survive entirely on iced coffee, grand gestures, and pure enthusiasm for storytelling."
  },
  {
    "insider_id": "user_18",
    "text": "I specialize in reactive threat intelligence and cyber-adversary profiling. Threat intelligence involves analyzing the digital footprint, tactics, and code signatures of hacking collectives to predict and intercept security breaches. Working as a cybersecurity analyst, I view the digital world as a perpetual game of chess against invisible adversaries. I am hyper-vigilant, highly skeptical, and collect analog cryptography tools."
  },
  {
    "insider_id": "user_19",
    "text": "I specialize in digital ethnography and the evolution of internet subcultures. Digital ethnography applies traditional anthropological fieldwork methods to online spaces, studying how memes, linguistic shifts, and virtual forums shape modern human identity. I treat internet subcultures with the same academic rigor others reserve for ancient civilizations. I am open-minded, endlessly curious, and love bridging high-brow theory with low-brow web culture."
  },
  {
    "insider_id": "user_20",
    "text": "I specialize in field mechanical diagnostics and bicycle drive-train engineering. Bicycle engineering focuses on optimizing mechanical efficiency, gear ratios, and structural weight limits for self-contained travel over rugged terrain. As a bicycle mechanic and bike-packer, I can fix almost anything with a multi-tool and a zip tie. I am happiest pedaling up mountain passes, valuing simple engineering and resourcefulness."
  },
  {
    "insider_id": "user_21",
    "text": "I specialize in the synthesis of natural botanical accord extraction. In perfumery, an accord is a balanced blend of distinct aromatic notes that fuse together to create an entirely new, unified olfactory impression. As a custom scent designer, I translate memories into these complex liquid formulas. I live a highly sensory life, love exploring botanical gardens, and find myself deeply annoyed by synthetic air fresheners."
  },
  {
    "insider_id": "user_22",
    "text": "I specialize in the mechanical escapement restoration of mid-century analog clocks. An escapement is the regulating mechanism in a clock that controls the wheel train's rotational speed, translating potential energy into steady, measured ticks. As a restoration expert, I love taking apart vintage machinery that has been rusted shut for fifty years. I prefer mechanical logic over software algorithms every single day."
  },
  {
    "insider_id": "user_23",
    "text": "I specialize in emergency humanitarian supply chain logistics. Crisis logistics involves coordinating international transport networks, customs clearances, and resource distribution within active disaster zones under extreme structural damage. As a relief coordinator, I deploy globally to manage these high-pressure operations. When off-duty, I practice extreme minimalism and free-diving to decompress."
  },
  {
    "insider_id": "user_24",
    "text": "I specialize in ambient acoustic ecology and field spatial recording. Acoustic ecology is the study of the social, structural, and ecological relationships mediated through the collective sounds of an environment. Working as an audio engineer, I travel to remote forests, deserts, and abandoned structures to capture these pristine soundscapes. I live in a world of high-end headphones, valuing deep, uninterrupted listening."
  },
  {
    "insider_id": "user_25",
    "text": "I specialize in international maritime salvage rights and admiralty law. Admiralty law governs legal disputes arising on navigable waters, covering specific historical and financial codes regarding shipwreck recovery, cargo damage, and open-ocean jurisdiction. As a maritime lawyer, I love analyzing these technical legal loopholes. I possess a dry sense of humor and spend my vacations sailing a 30-foot sloop."
  },
  {
    "insider_id": "user_26",
    "text": "I specialize in cryopreservation techniques for endangered seed banks. Seed cryopreservation involves drying and storing plant genetic material at ultra-low temperatures to halt cellular aging, safeguarding biodiversity against extinction. As a botanist, I find immense comfort in this slow, multi-generational timeline. I am quiet, deeply patient, and spend my weekends painting watercolors of forest fungi."
  },
  {
    "insider_id": "user_27",
    "text": "I specialize in observational satire and the psychology of comedic timing. Observational comedy relies on isolating standard societal hypocrisies and re-framing them in absurd contexts to elicit collective recognition and relief. I fund my stand-up comedy addiction by working as a night-shift security guard. My brain constantly distills everyday tragedy into punchlines, valuing raw honesty above all else."
  },
  {
    "insider_id": "user_28",
    "text": "I specialize in multi-modal transit planning and walkable urban design. Walkable urbanism centers on designing transit-oriented developments that phase out car dependency in favor of high-density housing, greenways, and micro-mobility lanes. As an urban planner, I view city streets as a puzzle of human behavior and zoning laws. I don't own a car and can spend hours advocating for protected bike paths."
  },
  {
    "insider_id": "user_29",
    "text": "I specialize in the application of traditional illustrative woodcut tattooing. Woodcut tattooing mimics the stark, textured cross-hatching techniques of medieval European relief printmaking, requiring precise line density and high contrast. As a tattoo artist, I treat this body modification as a permanent exchange of art and pain. I am heavily tattooed, deeply intuitive, and collect antique medical tools."
  },
  {
    "insider_id": "user_30",
    "text": "I specialize in the clinical rehabilitation and flight conditioning of raptors. Raptor rehabilitation involves specialized avian orthopedic splinting, wound care, and muscular conditioning to ensure injured birds of prey can hunt effectively before release. Working as a wildlife rehabilitator, my days are filled with setting eagle wings and feeding owls. I value fierce independence and natural animal instincts."
  }
]

async def seed_db():
    async with httpx.AsyncClient(timeout=60.0) as client:
        for bio in bios:
            response = await client.post("http://localhost:4012/api/v1/souls", json=bio)
            print(f"Created {bio['insider_id']}: Status {response.status_code}")
            
asyncio.run(seed_db())