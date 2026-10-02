const CITIES = [ {
  id: "orlando",
  name: "Orlando",
  state: "Florida",
  state_en: "Florida",
  state_pt: "Flórida",
  system: "Lynx Bus + SunRail",
  system_en: "Lynx Bus + SunRail",
  system_pt: "Lynx Bus + SunRail",
  price: "$2.00 por viaje (bus) · $2–$7 SunRail",
  price_en: "$2.00 per ride (bus) · $2–$7 SunRail",
  price_pt: "$2,00 por viagem (ônibus) · $2–$7 SunRail",
  payment: "Efectivo, tarjeta o app",
  payment_en: "Cash, card or app",
  payment_pt: "Dinheiro, cartão ou app",
  app: "Lynx Apps",
  appLink: "https://www.golynx.com/tripapps/",
  map: "https://www.golynx.com/maps-schedules/",
  mapLabel: "Mapa Lynx Bus",
  mapLabel_en: "Lynx Bus Map",
  mapLabel_pt: "Mapa Lynx Bus",
  gmaps: "https://maps.app.goo.gl/uzibdHS2ucyLHN8X8",
  tips_es: [ "🚗 Orlando está diseñada para el auto — el bus es lento entre parques", "🎢 Los parques tienen shuttles propios desde hoteles de la zona", "🚌 El I-Ride Trolley conecta International Drive por $2", "🅿️ Uber/Lyft es la opción más práctica para turistas", "🚂 SunRail conecta el centro con suburbios (lunes a viernes)" ],
  tips_en: [ "🚗 Orlando is car-centric — buses between parks are slow", "🎢 Parks have their own shuttles from nearby hotels", "🚌 I-Ride Trolley covers International Drive for $2", "🅿️ Uber/Lyft is the most practical option for tourists", "🚂 SunRail connects downtown to suburbs (Mon–Fri)" ],
  tips_pt: [ "🚗 Orlando é projetada para carros — ônibus entre parques é lento", "🎢 Os parques têm shuttles próprios dos hotéis da região", "🚌 O I-Ride Trolley conecta a International Drive por $2", "🅿️ Uber/Lyft é a opção mais prática para turistas", "🚂 SunRail conecta o centro aos subúrbios (seg–sex)" ]
}, {
  id: "newyork",
  name: "New York",
  state: "Nueva York",
  state_en: "New York",
  state_pt: "Nova Iorque",
  system: "MTA Subway + Bus + LIRR",
  system_en: "MTA Subway + Bus + LIRR",
  system_pt: "MTA Subway + Ônibus + LIRR",
  price: "$2.90 por viaje (metro y bus)",
  price_en: "$2.90 per ride (subway & bus)",
  price_pt: "$2,90 por viagem (metrô e ônibus)",
  payment: "OMNY (tarjeta/cel sin contacto) · MetroCard",
  payment_en: "OMNY (contactless card/phone) · MetroCard",
  payment_pt: "OMNY (cartão/cel sem contato) · MetroCard",
  app: "MTA App",
  appLink: "https://www.mta.info/guides/apps",
  map: "https://new.mta.info/maps",
  mapLabel: "Mapa Subway MTA",
  mapLabel_en: "MTA Subway Map",
  mapLabel_pt: "Mapa Metrô MTA",
  gmaps: "https://maps.app.goo.gl/FeB1po85VtZ4ktJo6",
  tips_es: [ "🕐 El metro funciona las 24 horas, los 7 días", "💳 OMNY: tocá con tu tarjeta de crédito/débito directo", "🎫 7-Day Unlimited: $34 — conviene si usás más de 12 veces", "🚕 Evitá el taxi en hora pico — el metro es más rápido", "✈️ AirTrain JFK + E train: la forma más barata de llegar desde el aeropuerto" ],
  tips_en: [ "🕐 Subway runs 24/7, 365 days", "💳 OMNY: tap your credit/debit card directly", "🎫 7-Day Unlimited: $34 — worth it if you ride more than 12 times", "🚕 Avoid taxis in rush hour — the subway is faster", "✈️ AirTrain JFK + E train: the cheapest way from the airport" ],
  tips_pt: [ "🕐 O metrô funciona 24 horas, 7 dias por semana", "💳 OMNY: toque com seu cartão de crédito/débito diretamente", "🎫 7-Day Unlimited: $34 — vale a pena se usar mais de 12 vezes", "🚕 Evite táxis no horário de pico — o metrô é mais rápido", "✈️ AirTrain JFK + trem E: a forma mais barata do aeroporto ao centro" ]
}, {
  id: "miami",
  name: "Miami",
  state: "Florida",
  state_en: "Florida",
  state_pt: "Flórida",
  system: "Metrorail + Metrobus + Metromover",
  system_en: "Metrorail + Metrobus + Metromover",
  system_pt: "Metrorail + Metrobus + Metromover",
  price: "$2.25 por viaje · Metromover GRATIS",
  price_en: "$2.25 per ride · Metromover FREE",
  price_pt: "$2,25 por viagem · Metromover GRATUITO",
  payment: "EASY Card o efectivo",
  payment_en: "EASY Card or cash",
  payment_pt: "EASY Card ou dinheiro",
  app: "Miami-Dade Transit App",
  appLink: "https://www.miamidade.gov/global/service.page?Mduid_service=ser1578323661475590",
  map: "https://www.miamidade.gov/resources/transportation_publicworks/documents/system-map-brochure.pdf",
  mapLabel: "Mapa MDT",
  mapLabel_en: "MDT System Map",
  mapLabel_pt: "Mapa MDT",
  gmaps: "https://maps.app.goo.gl/4LkZcz1Mwfmr5C56A",
  tips_es: [ "🆓 Metromover es completamente gratis — conecta el centro", "Miami Beach se llega en bus 150 o S desde el centro", "🚗 Para las playas, Uber/Lyft sigue siendo lo más cómodo", "🚴 Citi Bike disponible en Miami Beach y Brickell", "💳 EASY Card recargable en estaciones de Metrorail" ],
  tips_en: [ "🆓 Metromover is completely free — connects downtown", "🏖️ Reach Miami Beach via bus 150 or S from downtown", "🚗 For beaches, Uber/Lyft is still most convenient", "🚴 Citi Bike available in Miami Beach and Brickell", "💳 EASY Card rechargeable at Metrorail stations" ],
  tips_pt: [ "🆓 O Metromover é completamente gratuito — conecta o centro", "Miami Beach pelo ônibus 150 ou S do centro", "🚗 Para as praias, Uber/Lyft ainda é o mais cômodo", "🚴 Citi Bike disponível em Miami Beach e Brickell", "💳 EASY Card recarregável nas estações do Metrorail" ]
}, {
  id: "lasvegas",
  name: "Las Vegas",
  state: "Nevada",
  state_en: "Nevada",
  state_pt: "Nevada",
  system: "RTC Bus + Monorail + Deuce",
  system_en: "RTC Bus + Monorail + Deuce",
  system_pt: "RTC Ônibus + Monotrilho + Deuce",
  price: "$2–$6 (bus) · $5–$16 (Monorail)",
  price_en: "$2–$6 (bus) · $5–$16 (Monorail)",
  price_pt: "$2–$6 (ônibus) · $5–$16 (Monotrilho)",
  payment: "Efectivo o tarjeta en máquinas",
  payment_en: "Cash or card at machines",
  payment_pt: "Dinheiro ou cartão nas máquinas",
  app: "RTC Transit App",
  appLink: "https://rtcwashoe.com/public-transportation/rtc-transit-app/",
  map: "https://www.rtcsnv.com/ways-to-travel/schedules-maps/",
  mapLabel: "Mapa RTC",
  mapLabel_en: "RTC System Map",
  mapLabel_pt: "Mapa RTC",
  gmaps: "https://maps.app.goo.gl/XpoBTyLrAWjVMyUg6",
  tips_es: [ "🎰 El Strip es caminable — muchos turistas van a pie", "🚌 Deuce on the Strip: $6 pase 2hs, cubre todo el Strip 24hs", "🚝 Monorail conecta los casinos principales (no llega al aeropuerto)", "🚕 Lyft/Uber desde el aeropuerto es la mejor opción", "🎡 Las distancias parecen cortas pero hace calor — no subestimes" ],
  tips_en: [ "🎰 The Strip is walkable — many tourists go on foot", "🚌 Deuce on the Strip: $6 for 2hr pass, covers the entire Strip 24/7", "🚝 Monorail connects main casinos (does not reach airport)", "🚕 Lyft/Uber from the airport is the best option", "🎡 Distances seem short but it gets hot — don't underestimate" ],
  tips_pt: [ "🎰 A Strip é caminhável — muitos turistas vão a pé", "🚌 Deuce on the Strip: $6 para 2h, cobre toda a Strip 24h", "🚝 Monorail conecta os principais cassinos (não chega ao aeroporto)", "🚕 Lyft/Uber do aeroporto é a melhor opção", "🎡 As distâncias parecem curtas mas faz calor — não subestime" ]
}, {
  id: "losangeles",
  name: "Los Angeles",
  state: "California",
  state_en: "California",
  state_pt: "Califórnia",
  system: "Metro Rail + Metro Bus",
  system_en: "Metro Rail + Metro Bus",
  system_pt: "Metrô Rail + Ônibus Metro",
  price: "$1.75 por viaje",
  price_en: "$1.75 per ride",
  price_pt: "$1,75 por viagem",
  payment: "TAP Card (recargable)",
  payment_en: "TAP Card (rechargeable)",
  payment_pt: "TAP Card (recarregável)",
  app: "Metro LA Apps",
  appLink: "https://www.metro.net/riding/rider-apps/",
  map: "https://www.metro.net/riding/maps/",
  mapLabel: "Mapa Metro LA",
  mapLabel_en: "LA Metro Map",
  mapLabel_pt: "Mapa Metrô LA",
  gmaps: "https://maps.app.goo.gl/o5pDfwJJQpe6eLhW7",
  tips_es: [ "🚗 LA está diseñada para el auto — el metro cubre zonas limitadas", "🎬 Hollywood, Santa Monica y Downtown sí tienen metro", "💳 TAP Card: $2 el plástico + carga mínima $1.75", "🚌 Metro B Line conecta Hollywood con Downtown rápido", "🏖️ Santa Monica: tomá el Expo Line hasta el final" ],
  tips_en: [ "🚗 LA is car-centric — metro covers limited areas", "🎬 Hollywood, Santa Monica and Downtown do have metro", "💳 TAP Card: $2 for the card + minimum $1.75 load", "🚌 Metro B Line connects Hollywood to Downtown fast", "🏖️ Santa Monica: take the Expo Line to the end" ],
  tips_pt: [ "🚗 LA é projetada para carros — o metrô cobre áreas limitadas", "🎬 Hollywood, Santa Monica e Downtown têm metrô", "💳 TAP Card: $2 pelo cartão + carga mínima $1.75", "🚌 Metro B Line conecta Hollywood ao Downtown rapidamente", "🏖️ Santa Monica: pegue o Expo Line até o final" ]
}, {
  id: "sanfrancisco",
  name: "San Francisco",
  state: "California",
  state_en: "California",
  state_pt: "Califórnia",
  system: "BART + Muni Metro + Cable Car",
  system_en: "BART + Muni Metro + Cable Car",
  system_pt: "BART + Muni Metro + Bondinho",
  price: "$2.50–$6.85 BART · $2.50 Muni · $8 Cable Car",
  price_en: "$2.50–$6.85 BART · $2.50 Muni · $8 Cable Car",
  price_pt: "$2,50–$6,85 BART · $2,50 Muni · $8 Bondinho",
  payment: "Clipper Card · Apple Pay · Google Pay",
  payment_en: "Clipper Card · Apple Pay · Google Pay",
  payment_pt: "Clipper Card · Apple Pay · Google Pay",
  app: "MuniMobile App",
  appLink: "https://www.sfmta.com/getting-around/muni/fares/munimobile",
  map: "https://www.sfmta.com/maps",
  mapLabel: "Mapa SFMTA",
  mapLabel_en: "SFMTA Map",
  mapLabel_pt: "Mapa SFMTA",
  gmaps: "https://maps.app.goo.gl/vboTXuq8jzuEPfyB7",
  tips_es: [ "🚡 Cable Car: icónico pero caro ($8) — hacelo al menos una vez", "✈️ BART desde SFO al centro: $10, 30 minutos", "💳 Clipper Card: usala en BART, Muni y hasta ferry", "🚶 El centro es muy caminable — Fishermans Wharf, Union Square", "🌁 Para Alcatraz reservá el ferry con anticipación en Alcatraz City Cruises" ],
  tips_en: [ "🚡 Cable Car: iconic but pricey ($8) — do it at least once", "✈️ BART from SFO to downtown: $10, 30 minutes", "💳 Clipper Card: use it on BART, Muni and even ferries", "🚶 Downtown is very walkable — Fishermans Wharf, Union Square", "🌁 For Alcatraz book the ferry early at Alcatraz City Cruises" ],
  tips_pt: [ "🚡 Cable Car: icônico mas caro ($8) — faça pelo menos uma vez", "✈️ BART do SFO ao centro: $10, 30 minutos", "💳 Clipper Card: use no BART, Muni e até balsa", "🚶 O centro é muito caminhável — Fishermans Wharf, Union Square", "🌁 Para Alcatraz reserve a balsa com antecedência na Alcatraz City Cruises" ]
}, {
  id: "chicago",
  name: "Chicago",
  state: "Illinois",
  state_en: "Illinois",
  state_pt: "Illinois",
  system: "CTA L Train + Bus",
  system_en: "CTA L Train + Bus",
  system_pt: "CTA L Train + Ônibus",
  price: "$2.50 por viaje ($0.25 trasbordo)",
  price_en: "$2.50 per ride ($0.25 transfer)",
  price_pt: "$2,50 por viagem ($0,25 baldeação)",
  payment: "Ventra Card · Ventra App · tarjeta sin contacto",
  payment_en: "Ventra Card · Ventra App · contactless card",
  payment_pt: "Ventra Card · Ventra App · cartão sem contato",
  app: "Ventra App ",
  appLink: "https://www.ventrachicago.com/app/",
  map: "https://www.transitchicago.com/maps/",
  mapLabel: "Mapa CTA",
  mapLabel_en: "CTA Map",
  mapLabel_pt: "Mapa CTA",
  gmaps: "https://maps.app.goo.gl/APbs8J3KaMrMZMV29",
  tips_es: [ '🔵 El "L" (elevated train) cubre casi toda la ciudad', "✈️ Blue Line desde O'Hare al centro: $2.50, 45 min", "💳 Ventra App: cargá desde el cel y viajá sin tarjeta física", "🌬️ En invierno el frío es extremo — esperá el tren en ambientes cerrados", "🏙️ The Loop (centro) es muy caminable en verano" ],
  tips_en: [ '🔵 The "L" (elevated train) covers nearly the whole city', "✈️ Blue Line from O'Hare to downtown: $2.50, 45 min", "💳 Ventra App: load from your phone and travel without a physical card", "🌬️ Winters are extreme — wait for trains in heated areas", "🏙️ The Loop (downtown) is very walkable in summer" ],
  tips_pt: [ '🔵 O "L" (trem elevado) cobre quase toda a cidade', "✈️ Blue Line do O'Hare ao centro: $2.50, 45 min", "💳 Ventra App: carregue pelo celular e viaje sem cartão físico", "🌬️ No inverno o frio é extremo — espere o trem em locais fechados", "🏙️ The Loop (centro) é muito caminhável no verão" ]
}, {
  id: "washington",
  name: "Washington DC",
  state: "DC",
  state_en: "DC",
  state_pt: "DC",
  system: "Metro WMATA + Bus",
  system_en: "WMATA Metro + Bus",
  system_pt: "Metro WMATA + Ônibus",
  price: "$2–$6 según distancia y horario",
  price_en: "$2–$6 based on distance & time",
  price_pt: "$2–$6 conforme distância e horário",
  payment: "SmarTrip Card · tarjeta sin contacto",
  payment_en: "SmarTrip Card · contactless card",
  payment_pt: "SmarTrip Card · cartão sem contato",
  app: "MetroPulse",
  appLink: "https://www.wmata.com/initiatives/metropulse/index.cfm",
  map: "https://www.wmata.com/schedules/maps/",
  mapLabel: "Mapa Metro WMATA",
  mapLabel_en: "WMATA Metro Map",
  mapLabel_pt: "Mapa Metrô WMATA",
  gmaps: "https://maps.app.goo.gl/sPaFRFAidEM3jvwW7",
  tips_es: [ "🏛️ Todos los monumentos están en el Mall — se recorre a pie", "💳 SmarTrip Card obligatoria en el metro (no acepta efectivo)", "🚇 El metro cierra a medianoche (1am fines de semana)", "🆓 Los museos del Smithsonian son gratuitos — no necesitás reserva", "🚴 Capital Bikeshare disponible en toda la ciudad" ],
  tips_en: [ "🏛️ All monuments are on the Mall — easily walkable", "💳 SmarTrip Card required for metro (no cash accepted)", "🚇 Metro closes at midnight (1am on weekends)", "🆓 Smithsonian museums are free — no reservation needed", "🚴 Capital Bikeshare available throughout the city" ],
  tips_pt: [ "🏛️ Todos os monumentos estão no Mall — percurso a pé", "💳 SmarTrip Card obrigatório no metrô (não aceita dinheiro)", "🚇 O metrô fecha à meia-noite (1h nos fins de semana)", "🆓 Os museus do Smithsonian são gratuitos — sem necessidade de reserva", "🚴 Capital Bikeshare disponível por toda a cidade" ]
}, {
  id: "boston",
  name: "Boston",
  state: "Massachusetts",
  state_en: "Massachusetts",
  state_pt: "Massachusetts",
  system: "MBTA (The T) + Bus + Ferry",
  system_en: "MBTA (The T) + Bus + Ferry",
  system_pt: "MBTA (The T) + Ônibus + Balsa",
  price: "$2.40 metro · $1.70 bus",
  price_en: "$2.40 subway · $1.70 bus",
  price_pt: "$2,40 metrô · $1,70 ônibus",
  payment: "CharlieCard · CharlieTicket · tarjeta sin contacto",
  payment_en: "CharlieCard · CharlieTicket · contactless card",
  payment_pt: "CharlieCard · CharlieTicket · cartão sem contato",
  app: "MBTA App",
  appLink: "https://www.mbta.com/mbta-endorsed-apps",
  map: "https://www.mbta.com/maps",
  mapLabel: "Mapa MBTA",
  mapLabel_en: "MBTA Map",
  mapLabel_pt: "Mapa MBTA",
  gmaps: "https://maps.app.goo.gl/qc9c4gSynjnxVdfX6",
  tips_es: [ "🦞 El centro histórico es muy caminable — Freedom Trail a pie", "✈️ Silver Line SL1 desde Logan Airport: GRATIS al centro", "💳 CharlieCard recargable es más barata que el ticket de papel", "🔴 Red Line conecta Harvard, MIT y el aeropuerto", "⚾ Fenway Park: tomá la Green Line B/C/D hasta Kenmore" ],
  tips_en: [ "🦞 Historic downtown is very walkable — Freedom Trail on foot", "✈️ Silver Line SL1 from Logan Airport: FREE to downtown", "💳 CharlieCard is cheaper than the paper ticket", "🔴 Red Line connects Harvard, MIT and the airport", "⚾ Fenway Park: take the Green Line B/C/D to Kenmore" ],
  tips_pt: [ "🦞 O centro histórico é muito caminhável — Freedom Trail a pé", "✈️ Silver Line SL1 do Logan Airport: GRATUITO ao centro", "💳 CharlieCard recarregável é mais barata que o ticket de papel", "🔴 Red Line conecta Harvard, MIT e o aeroporto", "⚾ Fenway Park: pegue a Green Line B/C/D até Kenmore" ]
}, {
  id: "seattle",
  name: "Seattle",
  state: "Washington",
  state_en: "Washington",
  state_pt: "Washington",
  system: "Link Light Rail + Bus + Monorail",
  system_en: "Link Light Rail + Bus + Monorail",
  system_pt: "Link Light Rail + Ônibus + Monotrilho",
  price: "$2.25–$3.25 Light Rail · $2.75 Bus",
  price_en: "$2.25–$3.25 Light Rail · $2.75 Bus",
  price_pt: "$2,25–$3,25 Light Rail · $2,75 Ônibus",
  payment: "ORCA Card · tarjeta sin contacto",
  payment_en: "ORCA Card · contactless card",
  payment_pt: "ORCA Card · cartão sem contato",
  app: "One Bus Away App",
  appLink: "https://opentransitsoftwarefoundation.org/onebusaway",
  map: "https://www.soundtransit.org/get-to-know-us/maps",
  mapLabel: "Mapa Sound Transit",
  mapLabel_en: "Sound Transit Map",
  mapLabel_pt: "Mapa Sound Transit",
  gmaps: "https://maps.app.goo.gl/nWWm2XAQfqHtuyV18",
  tips_es: [ "✈️ Link Light Rail desde SeaTac al centro: $3.25, 38 min", "💳 ORCA Card: sirve en bus, light rail y ferry", "🚡 Monorail conecta el centro con Seattle Center / Space Needle", "⛴️ Washington State Ferries: vistas increíbles a las islas", "☕ Capitol Hill y Pike Place son caminables desde el centro" ],
  tips_en: [ "✈️ Link Light Rail from SeaTac to downtown: $3.25, 38 min", "💳 ORCA Card: works on bus, light rail and ferry", "🚡 Monorail connects downtown to Seattle Center / Space Needle", "⛴️ Washington State Ferries: amazing island views", "☕ Capitol Hill and Pike Place are walkable from downtown" ],
  tips_pt: [ "✈️ Link Light Rail do SeaTac ao centro: $3.25, 38 min", "💳 ORCA Card: serve em ônibus, light rail e balsa", "🚡 Monorail conecta o centro ao Seattle Center / Space Needle", "⛴️ Washington State Ferries: vistas incríveis das ilhas", "☕ Capitol Hill e Pike Place são caminháveis do centro" ]
}, {
  id: "neworleans",
  name: "New Orleans",
  state: "Luisiana",
  state_en: "Louisiana",
  state_pt: "Louisiana",
  system: "RTA Streetcar + Bus",
  system_en: "RTA Streetcar + Bus",
  system_pt: "RTA Bondinho + Ônibus",
  price: "$1.25 por viaje · $3 pase diario",
  price_en: "$1.25 per ride · $3 daily pass",
  price_pt: "$1,25 por viagem · $3 passe diário",
  payment: "Jazzy Pass · efectivo",
  payment_en: "Jazzy Pass · cash",
  payment_pt: "Jazzy Pass · dinheiro",
  app: "RTA GoMobile",
  appLink: "https://www.neworleans.com/plan/mobile-apps/",
  map: "https://www.norta.com/RTA/media/Maps/RTA-System-Map-Current.pdf",
  mapLabel: "Mapa RTA NOLA",
  mapLabel_en: "RTA NOLA Map",
  mapLabel_pt: "Mapa RTA NOLA",
  gmaps: "https://maps.app.goo.gl/YLypuZTjNXZLt3Fk6",
  tips_es: [ "🚋 Streetcar St. Charles: el más antiguo del mundo en operación", "🎷 El French Quarter es completamente caminable", "🚌 Pase diario de $3 — conviene si usás más de 2 veces", "🌙 El Streetcar corre hasta tarde (ideal para Bourbon Street)", "🏘️ Garden District: tomá el Streetcar St. Charles desde Canal St" ],
  tips_en: [ "🚋 St. Charles Streetcar: oldest still in operation in the world", "🎷 The French Quarter is completely walkable", "🚌 Daily pass $3 — worth it if you ride more than twice", "🌙 The Streetcar runs late (perfect for Bourbon Street)", "🏘️ Garden District: take the St. Charles Streetcar from Canal St" ],
  tips_pt: [ "🚋 Streetcar St. Charles: o mais antigo em operação no mundo", "🎷 O French Quarter é completamente caminhável", "🚌 Passe diário de $3 — vale a pena se usar mais de 2 vezes", "🌙 O Streetcar vai até tarde (ideal para Bourbon Street)", "🏘️ Garden District: pegue o Streetcar St. Charles na Canal St" ]
}, {
  id: "denver",
  name: "Denver",
  state: "Colorado",
  state_en: "Colorado",
  state_pt: "Colorado",
  system: "RTD Bus + Light Rail + A Line",
  system_en: "RTD Bus + Light Rail + A Line",
  system_pt: "RTD Ônibus + Light Rail + Linha A",
  price: "$3 por viaje · $10.50 al aeropuerto",
  price_en: "$3 per ride · $10.50 to airport",
  price_pt: "$3 por viagem · $10,50 até o aeroporto",
  payment: "MyRide App · tarjeta sin contacto · efectivo",
  payment_en: "MyRide App · contactless card · cash",
  payment_pt: "MyRide App · cartão sem contato · dinheiro",
  app: "RTD MyRide App",
  appLink: "https://www.rtd-denver.com/es/fares-passes/myride",
  map: "https://www.rtd-denver.com/es/system-map",
  mapLabel: "Mapa RTD Denver",
  mapLabel_en: "RTD Denver Map",
  mapLabel_pt: "Mapa RTD Denver",
  gmaps: "https://maps.app.goo.gl/5VbCJVJt9cmx8fLJ8",
  tips_es: [ "✈️ A Line desde DEN al centro: $10.50, 37 min (rapidísimo)", "🏔️ Para los parques nacionales necesitás auto — el transporte no llega", "🚋 Free MallRide: bus gratuito en el centro de Denver", "🎿 Para ir a Vail/Breckenridge: Bustang o auto de alquiler", "☀️ Denver tiene 300 días de sol al año — bici compartida es opción" ],
  tips_en: [ "✈️ A Line from DEN to downtown: $10.50, 37 min (super fast)", "🏔️ For national parks you need a car — transit doesn't reach", "🚋 Free MallRide: free bus in downtown Denver", "🎿 For Vail/Breckenridge: Bustang or rental car", "☀️ Denver has 300 sunny days a year — bike-share is an option" ],
  tips_pt: [ "✈️ A Line do DEN ao centro: $10.50, 37 min (rapidíssimo)", "🏔️ Para os parques nacionais você precisa de carro — o transporte não chega", "🚋 Free MallRide: ônibus gratuito no centro de Denver", "🎿 Para Vail/Breckenridge: Bustang ou aluguel de carro", "☀️ Denver tem 300 dias de sol por ano — bicicleta compartilhada é opção" ]
} ];

window.renderCityGrid = function renderCityGrid() {
  const grid = document.getElementById("city-grid");
  if (!grid) return;
  const lang = localStorage.getItem("appLang") || "es";
  grid.innerHTML = CITIES.map(c => {
    const cityState = lang !== "es" && c["state_" + lang] ? c["state_" + lang] : c.state;
    return `\n        <button onclick="showCity('${c.id}')" id="citybtn-${c.id}" style="background:var(--surface-2);border:1.5px solid var(--border);border-radius:12px;padding:10px 8px;cursor:pointer;font-family:inherit;transition:all .2s;text-align:center;">\n            <div style="font-size:.72rem;font-weight:800;color:var(--text);margin-top:3px;">${esc(c.name)}</div>\n            <div style="font-size:.58rem;font-weight:600;color:var(--text-dim);">${cityState}</div>\n        </button>`;
  }).join("");
};

window.activeCity = null;

window.showCity = function showCity(id) {
  const city = CITIES.find(c => c.id === id);
  if (!city) return;
  const panel = document.getElementById("city-panel");
  const lang = localStorage.getItem("appLang") || "es";
  const t = window._i18n && window._i18n[lang] || {};
  if (window.activeCity === id) {
    window.activeCity = null;
    panel.style.display = "none";
    document.querySelectorAll('[id^="citybtn-"]').forEach(b => {
      b.style.borderColor = "var(--border)";
      b.style.background = "var(--surface-2)";
    });
    return;
  }
  window.activeCity = id;
  document.querySelectorAll('[id^="citybtn-"]').forEach(b => {
    b.style.borderColor = "var(--border)";
    b.style.background = "var(--surface-2)";
  });
  const activeBtn = document.getElementById("citybtn-" + id);
  if (activeBtn) {
    activeBtn.style.borderColor = "var(--primary)";
    activeBtn.style.background = "var(--primary-dim)";
  }
  const tips = city["tips_" + lang] || city.tips_es;
  const sysLabel = t.transport_system || "🚇 Sistema";
  const priceLabel = t.transport_price || "💵 Precio";
  const payLabel = t.transport_payment || "💳 Pago";
  const appLabel = t.transport_app || "📱 App recomendada";
  const tipsLabel = t.transport_tips || "💡 Tips locales";
  const officialLabel = t.transport_official || "Oficial PDF/Web";
  const realtimeLabel = t.transport_realtime || "Tiempo real";
  const citySystem = lang !== "es" && city["system_" + lang] ? city["system_" + lang] : city.system;
  const cityPrice = lang !== "es" && city["price_" + lang] ? city["price_" + lang] : city.price;
  const cityPayment = lang !== "es" && city["payment_" + lang] ? city["payment_" + lang] : city.payment;
  const cityState = lang !== "es" && city["state_" + lang] ? city["state_" + lang] : city.state;
  const cityMapLabel = lang !== "es" && city["mapLabel_" + lang] ? city["mapLabel_" + lang] : city.mapLabel;
  panel.style.display = "block";
  panel.innerHTML = `\n        <div style="border-top:1px solid var(--border);padding-top:14px;margin-top:4px;">\n            <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">\n                <div>\n                    <div style="font-size:1rem;font-weight:900;color:var(--text);">${esc(city.name)}</div>\n                    <div style="font-size:.7rem;font-weight:600;color:var(--text-dim);">${cityState}</div>\n                </div>\n            </div>\n            <div style="display:flex;flex-direction:column;gap:10px;">\n                <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;">\n                    <div style="font-size:.6rem;font-weight:800;color:var(--text-dim);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px;">${sysLabel}</div>\n                    <div style="font-size:.82rem;font-weight:700;color:var(--text);">${citySystem}</div>\n                </div>\n                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">\n                    <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:12px;">\n                        <div style="font-size:.6rem;font-weight:800;color:var(--text-dim);text-transform:uppercase;letter-spacing:.8px;margin-bottom:5px;">${priceLabel}</div>\n                        <div style="font-size:.75rem;font-weight:700;color:var(--text);line-height:1.4;">${cityPrice}</div>\n                    </div>\n                    <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:12px;">\n                        <div style="font-size:.6rem;font-weight:800;color:var(--text-dim);text-transform:uppercase;letter-spacing:.8px;margin-bottom:5px;">${payLabel}</div>\n                        <div style="font-size:.75rem;font-weight:700;color:var(--text);line-height:1.4;">${cityPayment}</div>\n                    </div>\n                </div>\n                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">\n                    <a href="${city.map}" target="_blank" style="background:var(--primary);color:white;border-radius:12px;padding:12px;text-decoration:none;display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;">\n                        <span style="font-size:1.2rem;">🗺️</span>\n                        <span style="font-size:.7rem;font-weight:800;">${cityMapLabel}</span>\n                        <span style="font-size:.6rem;opacity:.85;">${officialLabel}</span>\n                    </a>\n                    <a href="${city.gmaps}" target="_blank" style="background:var(--accent);color:white;border-radius:12px;padding:12px;text-decoration:none;display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;">\n                        <span style="font-size:1.2rem;">📍</span>\n                        <span style="font-size:.7rem;font-weight:800;">Google Maps</span>\n                        <span style="font-size:.6rem;opacity:.85;">${realtimeLabel}</span>\n                    </a>\n                </div>\n                <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;">\n                    <div style="font-size:.6rem;font-weight:800;color:var(--text-dim);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px;">${appLabel}</div>\n                    <a href="${city.appLink}" target="_blank" style="font-size:.8rem;font-weight:700;color:var(--primary);text-decoration:none;">${city.app}</a>\n                </div>\n                <div style="background:rgba(16,185,129,.08);border:1.5px solid var(--success);border-radius:12px;padding:12px 14px;">\n                    <div style="font-size:.6rem;font-weight:800;color:var(--success);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px;">${tipsLabel}</div>\n                    <div style="display:flex;flex-direction:column;gap:6px;">\n                        ${tips.map(tip => `<div style="font-size:.75rem;font-weight:600;color:var(--text);line-height:1.4;">${tip}</div>`).join("")}\n                    </div>\n                </div>\n            </div>\n        </div>\n    `;
  panel.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
};

document.addEventListener("DOMContentLoaded", renderCityGrid);
