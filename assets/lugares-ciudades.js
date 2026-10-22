const CITIES = [
  {
    "id": "orlando",
    "name": "Orlando",
    "state": "Florida",
    "state_en": "Florida",
    "state_pt": "Flórida",
    "system": "Lynx Bus + SunRail",
    "system_en": "Lynx Bus + SunRail",
    "system_pt": "Lynx Bus + SunRail",
    "price": "LYNX US$2 · pase diario US$4,50; SunRail según zonas",
    "price_en": "LYNX $2 · all-day pass $4.50; SunRail by zone",
    "price_pt": "LYNX US$2 · passe diário US$4,50; SunRail por zonas",
    "payment": "Consulta opciones LYNX; pases digitales en Paw Pass",
    "payment_en": "Check LYNX payment options; digital passes in Paw Pass",
    "payment_pt": "Confira as opções LYNX; passes digitais no Paw Pass",
    "app": "Lynx Apps",
    "appLink": "https://www.golynx.com/tripapps/",
    "map": "https://www.golynx.com/maps-schedules/",
    "mapLabel": "Mapa Lynx Bus",
    "mapLabel_en": "Lynx Bus Map",
    "mapLabel_pt": "Mapa Lynx Bus",
    "gmaps": "https://maps.app.goo.gl/uzibdHS2ucyLHN8X8",
    "tips_es": [
      "🚌 LYNX: pasaje regular US$2; el pase de todo el día cuesta US$4,50.",
      "🎫 Si necesitas combinar buses LYNX, pide el transbordo al subir: vale 90 minutos, sin vuelta ni repetición de la misma línea.",
      "🚎 I-RIDE Trolley: US$2 por viaje de adulto, con importe exacto; el conductor no da cambio.",
      "🗺️ El I-RIDE recorre el área de International Drive. Revisa su mapa antes de usarlo para ir a un parque fuera de ese corredor.",
      "🚂 SunRail opera habitualmente de lunes a viernes; no cuentes con trenes regulares de fin de semana. Revisa servicios especiales.",
      "🚄 La estación Brightline de Orlando está en MCO, junto a la Terminal C. Reserva tiempo para llegar desde tu hotel o parque.",
      "🕒 Antes de elegir bus para volver de los parques, comprueba la última salida y la parada exacta; guarda una alternativa para después del cierre."
    ],
    "tips_en": [
      "🚌 LYNX regular fare is $2; an all-day pass costs $4.50.",
      "🎫 Ask for a LYNX transfer when boarding: valid 90 minutes, excluding return trips and the same route.",
      "🚎 I-RIDE Trolley adult fare is $2 per ride; have exact cash, as drivers give no change.",
      "🗺️ I-RIDE serves the International Drive area; check its route map before planning trips to parks outside that corridor.",
      "🚂 SunRail normally runs Monday–Friday; do not assume regular weekend trains. Check for special services.",
      "🚄 Orlando’s Brightline station is at MCO beside Terminal C; allow time to get there from your hotel or park.",
      "🕒 Before taking a bus back from a park, check the last departure and exact stop; save an alternative for after closing."
    ],
    "tips_pt": [
      "🚌 LYNX: tarifa regular US$2; passe diário US$4,50.",
      "🎫 Peça a integração LYNX ao embarcar: vale 90 minutos, sem volta nem repetição da mesma linha.",
      "🚎 I-RIDE Trolley: US$2 por viagem de adulto; leve o valor exato, pois o motorista não dá troco.",
      "🗺️ O I-RIDE atende a região da International Drive; confira o mapa antes de planejar ir a parques fora desse corredor.",
      "🚂 O SunRail opera normalmente de segunda a sexta; não conte com trens regulares no fim de semana. Confira serviços especiais.",
      "🚄 A estação Brightline de Orlando fica no MCO, junto ao Terminal C. Reserve tempo para sair do hotel ou parque.",
      "🕒 Antes de voltar de ônibus dos parques, confira a última saída e o ponto exato; deixe uma alternativa para depois do fechamento."
    ]
  },
  {
    "id": "newyork",
    "name": "New York",
    "state": "Nueva York",
    "state_en": "New York",
    "state_pt": "Nova Iorque",
    "system": "MTA Subway + Bus + LIRR",
    "system_en": "MTA Subway + Bus + LIRR",
    "system_pt": "MTA Subway + Ônibus + LIRR",
    "price": "US$3 metro/bus local · tope OMNY US$35/7 días",
    "price_en": "Subway/local bus $3 · OMNY cap $35/7 days",
    "price_pt": "US$3 metrô/ônibus local · teto OMNY US$35/7 dias",
    "payment": "OMNY: tarjeta bancaria sin contacto, celular o tarjeta OMNY",
    "payment_en": "OMNY: contactless bank card, phone or OMNY card",
    "payment_pt": "OMNY: cartão bancário por aproximação, celular ou cartão OMNY",
    "app": "MTA App",
    "appLink": "https://www.mta.info/guides/apps",
    "map": "https://new.mta.info/maps",
    "mapLabel": "Mapa Subway MTA",
    "mapLabel_en": "MTA Subway Map",
    "mapLabel_pt": "Mapa Metrô MTA",
    "gmaps": "https://maps.app.goo.gl/FeB1po85VtZ4ktJo6",
    "tips_es": [
      "🚇 Metro y buses locales: tarifa regular US$3; buses express y AirTrain tienen tarifas distintas.",
      "💳 OMNY limita el gasto de metro y buses locales a US$35 en 7 días con el mismo medio de pago.",
      "📱 Tarjeta física y la misma tarjeta en el celular pueden sumar por separado: no alternes si quieres alcanzar el tope.",
      "👥 Si pagas por acompañantes, sus viajes no se suman al tope de tu primer pasaje. Revisa las reglas de OMNY para grupos.",
      "✈️ AirTrain JFK se paga aparte del metro o LIRR. Compara el viaje completo, no solo la tarifa del tren urbano.",
      "⛴️ El Staten Island Ferry de NYC DOT es gratuito entre Lower Manhattan y Staten Island. No es un desembarco en Liberty Island.",
      "💳 Para pagar OMNY, acerca solo la tarjeta o el dispositivo que elegiste; no apoyes una billetera con varias tarjetas."
    ],
    "tips_en": [
      "🚇 Regular subway/local-bus fare is $3; express buses and AirTrain have separate fares.",
      "💳 OMNY caps subway/local-bus spending at $35 over seven days with the same payment method.",
      "📱 A physical card and its phone-wallet version can count separately; do not switch if you want the cap.",
      "👥 Companion fares paid with your card do not build the cap for your first fare. Check OMNY’s group-payment rules.",
      "✈️ JFK AirTrain costs extra on top of subway or LIRR fares; compare the full journey.",
      "⛴️ NYC DOT’s Staten Island Ferry is free between Lower Manhattan and Staten Island; it does not stop on Liberty Island.",
      "💳 Tap only your chosen OMNY card or device, as on London’s Tube; keep other contactless cards away from the reader."
    ],
    "tips_pt": [
      "🚇 Metrô e ônibus locais: tarifa regular US$3; ônibus expressos e AirTrain têm tarifas diferentes.",
      "💳 O OMNY limita metrô e ônibus locais a US$35 em 7 dias com o mesmo meio de pagamento.",
      "📱 Cartão físico e o mesmo cartão no celular podem contar separadamente; não alterne se quiser atingir o teto.",
      "👥 Viagens dos acompanhantes pagas com seu cartão não somam ao teto da sua primeira passagem. Confira as regras de grupo do OMNY.",
      "✈️ O AirTrain JFK é pago separadamente do metrô ou LIRR; compare o trajeto completo.",
      "⛴️ O Staten Island Ferry da NYC DOT é gratuito entre Lower Manhattan e Staten Island; não desembarca na Liberty Island.",
      "💳 Encoste só o cartão ou dispositivo escolhido no OMNY; não aproxime uma carteira com vários cartões."
    ],
    "tips_es_AR": [
      "💳 Como el gesto de usar la SUBE, pero con tu tarjeta bancaria o celular: OMNY no exige comprar y recargar una tarjeta de transporte."
    ]
  },
  {
    "id": "miami",
    "name": "Miami",
    "state": "Florida",
    "state_en": "Florida",
    "state_pt": "Flórida",
    "system": "Metrorail + Metrobus + Metromover",
    "system_en": "Metrorail + Metrobus + Metromover",
    "system_pt": "Metrorail + Metrobus + Metromover",
    "price": "US$2,25 regular · Metromover gratis",
    "price_en": "Regular $2.25 · Metromover free",
    "price_pt": "US$2,25 regular · Metromover gratuito",
    "payment": "Tarjeta bancaria sin contacto, billetera digital o EASY Card",
    "payment_en": "Contactless bank card, mobile wallet or EASY Card",
    "payment_pt": "Cartão bancário por aproximação, carteira digital ou EASY Card",
    "app": "GO Miami-Dade Transit",
    "appLink": "https://www.miamidade.gov/global/service.page?Mduid_service=ser1578323661475590",
    "map": "https://www.miamidade.gov/resources/transportation_publicworks/documents/system-map-brochure.pdf",
    "mapLabel": "Mapa MDT",
    "mapLabel_en": "MDT System Map",
    "mapLabel_pt": "Mapa MDT",
    "gmaps": "https://maps.app.goo.gl/4LkZcz1Mwfmr5C56A",
    "tips_es": [
      "🎫 La tarifa regular de Metrorail y Metrobus es US$2,25. Metromover es gratuito.",
      "💳 Puedes usar tarjeta bancaria sin contacto o billetera digital en Metrorail y Metrobus; no necesitas comprar una EASY Card para el pasaje regular.",
      "📱 Con pago bancario sin contacto, el tope diario es US$5,65; usa siempre la misma tarjeta o dispositivo.",
      "✈️ Desde las terminales de MIA, el MIA Mover gratuito conecta con el centro de transporte; no lo confundas con el Metromover del centro.",
      "🚆 La línea Orange de Metrorail sirve la estación del aeropuerto MIA. Verifica la dirección del tren antes de subir.",
      "🏖️ Para Miami Beach, consulta un trayecto que cruce a la isla: el Metrorail no te deja directamente en South Beach.",
      "🔁 Para conservar beneficios de transbordo, usa el mismo medio electrónico; pagar cada bus en efectivo puede cambiar el costo del recorrido."
    ],
    "tips_en": [
      "🎫 Regular Metrorail/Metrobus fare is $2.25; Metromover is free.",
      "💳 Tap a contactless bank card or mobile wallet on Metrorail/Metrobus; an EASY Card is not required for regular fares.",
      "📱 Contactless bank-card payment caps daily fares at $5.65; keep using the same card or device.",
      "✈️ The free MIA Mover links airport terminals with the transport centre; it is different from downtown Metromover.",
      "🚆 Metrorail’s Orange Line serves MIA airport station; check the train’s destination before boarding.",
      "🏖️ Plan a connection across to Miami Beach; Metrorail does not take you directly to South Beach.",
      "🔁 Keep the same electronic payment method for transfer benefits; separate cash bus fares can change the trip cost."
    ],
    "tips_pt": [
      "🎫 A tarifa regular de Metrorail e Metrobus é US$2,25; o Metromover é gratuito.",
      "💳 Use cartão bancário por aproximação ou carteira digital no Metrorail/Metrobus, sem comprar EASY Card para a tarifa regular.",
      "📱 Com cartão bancário por aproximação, o teto diário é US$5,65; use sempre o mesmo cartão ou dispositivo.",
      "✈️ O MIA Mover gratuito liga os terminais ao centro de transporte; é diferente do Metromover do centro da cidade.",
      "🚆 A linha Orange do Metrorail atende a estação do aeroporto MIA; confira o destino do trem antes de embarcar.",
      "🏖️ Para Miami Beach, planeje a conexão até a ilha; o Metrorail não deixa você diretamente em South Beach.",
      "🔁 Use o mesmo meio eletrônico para aproveitar a integração; pagar cada ônibus em dinheiro pode mudar o custo do trajeto."
    ]
  },
  {
    "id": "lasvegas",
    "name": "Las Vegas",
    "state": "Nevada",
    "state_en": "Nevada",
    "state_pt": "Nevada",
    "system": "RTC Bus + Monorail + Deuce",
    "system_en": "RTC Bus + Monorail + Deuce",
    "system_pt": "RTC Ônibus + Monotrilho + Deuce",
    "price": "Strip: US$6/2 h · US$8/24 h · Monorail aparte",
    "price_en": "Strip: $6/2 hr · $8/24 hr · Monorail separate",
    "price_pt": "Strip: US$6/2 h · US$8/24 h · Monorail separado",
    "payment": "Pases RTC; consulta compra en app o máquinas",
    "payment_en": "RTC passes; check app or ticket-machine options",
    "payment_pt": "Passes RTC; confira compra no app ou nas máquinas",
    "app": "RTC Transit App",
    "appLink": "https://rtcwashoe.com/public-transportation/rtc-transit-app/",
    "map": "https://www.rtcsnv.com/ways-to-travel/schedules-maps/",
    "mapLabel": "Mapa RTC",
    "mapLabel_en": "RTC System Map",
    "mapLabel_pt": "Mapa RTC",
    "gmaps": "https://maps.app.goo.gl/XpoBTyLrAWjVMyUg6",
    "tips_es": [
      "🎫 Deuce/Strip & All Access: pase de 2 h US$6, de 24 h US$8 y de 3 días US$20.",
      "🚌 Para recorrer el Strip, elige la tarifa Strip & All Access: no presupuestes automáticamente la tarifa residencial.",
      "✈️ El aeropuerto tiene rutas RTC específicas. Consulta la ruta según tu terminal y destino; no supongas que el Deuce pasa por la terminal.",
      "🚝 El Monorail vende boletos propios: no presupongas que tu pase de bus RTC lo incluye. Compara ambos trayectos.",
      "🚶 Antes de elegir una estación del Monorail, calcula también la caminata entre la calle, el casino y el andén.",
      "🗺️ En RTC, revisa sentido y parada del bus de regreso: el recorrido opuesto puede usar otra calle.",
      "🕒 Consulta los desvíos RTC del día antes de salir al Strip; no dependas solo de un mapa guardado de otro viaje."
    ],
    "tips_en": [
      "🎫 Deuce/Strip & All Access passes: $6 for 2 hours, $8 for 24 hours, $20 for 3 days.",
      "🚌 For the Strip, choose the Strip & All Access fare rather than automatically budgeting a residential fare.",
      "✈️ Airport RTC routes depend on terminal and destination; do not assume the Deuce stops at your terminal.",
      "🚝 The Monorail sells its own tickets; do not assume your RTC bus pass includes it. Compare routes.",
      "🚶 When choosing a Monorail station, include the walk from the street through the resort to the platform.",
      "🗺️ Check RTC’s return direction and stop; the opposite journey may use a different street.",
      "🕒 Check RTC’s current detours before heading to the Strip instead of relying only on an old saved map."
    ],
    "tips_pt": [
      "🎫 Deuce/Strip & All Access: US$6 por 2 h, US$8 por 24 h e US$20 por 3 dias.",
      "🚌 Para o Strip, escolha a tarifa Strip & All Access; não conte automaticamente com a tarifa residencial.",
      "✈️ As rotas RTC do aeroporto dependem do terminal e do destino; não presuma que o Deuce passe no terminal.",
      "🚝 O Monorail vende bilhetes próprios; não presuma que esteja incluído no passe de ônibus RTC.",
      "🚶 Ao escolher uma estação do Monorail, inclua a caminhada da rua pelo resort até a plataforma.",
      "🗺️ Confira o sentido e o ponto de volta na RTC; o trajeto contrário pode usar outra rua.",
      "🕒 Confira os desvios atuais da RTC antes de sair para o Strip, em vez de usar só um mapa salvo de outra viagem."
    ]
  },
  {
    "id": "losangeles",
    "name": "Los Angeles",
    "state": "California",
    "state_en": "California",
    "state_pt": "Califórnia",
    "system": "Metro Rail + Metro Bus",
    "system_en": "Metro Rail + Metro Bus",
    "system_pt": "Metrô Rail + Ônibus Metro",
    "price": "$1.75 por viaje",
    "price_en": "$1.75 per ride",
    "price_pt": "$1,75 por viagem",
    "payment": "TAP, tarjeta bancaria sin contacto o billetera digital; efectivo en bus",
    "payment_en": "TAP, contactless bank card or mobile wallet; cash on buses",
    "payment_pt": "TAP, cartão bancário por aproximação ou carteira digital; dinheiro no ônibus",
    "app": "Metro LA Apps",
    "appLink": "https://www.metro.net/riding/rider-apps/",
    "map": "https://www.metro.net/riding/maps/",
    "mapLabel": "Mapa Metro LA",
    "mapLabel_en": "LA Metro Map",
    "mapLabel_pt": "Mapa Metrô LA",
    "gmaps": "https://maps.app.goo.gl/o5pDfwJJQpe6eLhW7",
    "tips_es": [
      "🎫 Metro: tarifa regular US$1,75. Los servicios de otras operadoras pueden tener tarifas distintas.",
      "💳 En Metro, el tope regular es US$5 diarios y US$18 en 7 días con el mismo medio compatible.",
      "🔁 Con TAP o tarjeta bancaria compatible, Metro incluye transbordos durante 2 h; no incluye viajes de ida y vuelta.",
      "📱 Ya puedes pagar Metro con tarjeta bancaria sin contacto o billetera digital; no hace falta comprar TAP para una tarifa regular.",
      "💵 El efectivo en el bus requiere importe exacto y no acumula los topes de Metro.",
      "🚇 La línea B conecta Union Station con North Hollywood; consulta la parada de Hollywood que corresponde a tu visita.",
      "🏖️ La línea E llega a Santa Monica. Revisa el destino y las conexiones del tren, no solo los antiguos nombres de colores."
    ],
    "tips_en": [
      "🎫 Metro’s regular fare is $1.75; other operators may charge differently.",
      "💳 Metro’s regular caps are $5 per day and $18 over seven days using the same eligible payment method.",
      "🔁 TAP or eligible bank-card payment includes Metro transfers for 2 hours, excluding round trips.",
      "📱 You can now tap a bank card or mobile wallet on Metro, without buying TAP for a regular fare.",
      "💵 Cash bus payment requires the exact fare and does not count towards Metro fare caps.",
      "🚇 The B Line connects Union Station with North Hollywood; choose the Hollywood stop for your destination.",
      "🏖️ The E Line reaches Santa Monica; check destinations and connections rather than relying on old colour names."
    ],
    "tips_pt": [
      "🎫 Metro: tarifa regular US$1,75; outras operadoras podem cobrar valores diferentes.",
      "💳 No Metro, os tetos regulares são US$5 por dia e US$18 em 7 dias com o mesmo meio compatível.",
      "🔁 Com TAP ou cartão bancário compatível, o Metro inclui integração por 2 h, sem viagens de ida e volta.",
      "📱 Já é possível pagar o Metro com cartão bancário por aproximação ou carteira digital, sem comprar TAP para a tarifa regular.",
      "💵 O pagamento em dinheiro no ônibus exige valor exato e não acumula os tetos do Metro.",
      "🚇 A linha B liga Union Station a North Hollywood; confira a estação de Hollywood adequada ao passeio.",
      "🏖️ A linha E chega a Santa Monica; confira destinos e conexões, em vez de depender dos antigos nomes por cor."
    ]
  },
  {
    "id": "sanfrancisco",
    "name": "San Francisco",
    "state": "California",
    "state_en": "California",
    "state_pt": "Califórnia",
    "system": "BART + Muni Metro + Cable Car",
    "system_en": "BART + Muni Metro + Cable Car",
    "system_pt": "BART + Muni Metro + Bondinho",
    "price": "Muni US$2,85 electrónico / US$3 efectivo · cable car US$9 · BART según trayecto",
    "price_en": "Muni $2.85 electronic / $3 cash · cable car $9 · BART by journey",
    "price_pt": "Muni US$2,85 eletrônico / US$3 dinheiro · cable car US$9 · BART por trajeto",
    "payment": "Clipper o tarjeta bancaria; MuniMobile según pase",
    "payment_en": "Clipper or bank card; MuniMobile depending on pass",
    "payment_pt": "Clipper ou cartão bancário; MuniMobile conforme o passe",
    "app": "MuniMobile App",
    "appLink": "https://www.sfmta.com/getting-around/muni/fares/munimobile",
    "map": "https://www.sfmta.com/maps",
    "mapLabel": "Mapa SFMTA",
    "mapLabel_en": "SFMTA Map",
    "mapLabel_pt": "Mapa SFMTA",
    "gmaps": "https://maps.app.goo.gl/vboTXuq8jzuEPfyB7",
    "tips_es": [
      "🎫 Muni regular: US$2,85 con Clipper o tarjeta bancaria; US$3 en efectivo o máquina.",
      "🔁 El pasaje regular Muni permite 120 minutos de viaje; conserva el comprobante de pago.",
      "🚋 Cable car: US$9 por viaje, sin transbordo incluido. No es la misma tarifa que un tranvía Muni regular.",
      "🎟️ El Day Pass Muni de US$5,70 no incluye cable cars.",
      "🎟️ El Visitor Passport de un día cuesta US$15 e incluye Muni y cable cars; no incluye BART.",
      "💳 En BART puedes pagar con tarjeta bancaria sin contacto; usa el mismo medio al entrar y salir, uno por viajero.",
      "✈️ BART llega a SFO; su tarifa depende del trayecto y se paga aparte de los pases turísticos Muni."
    ],
    "tips_en": [
      "🎫 Regular Muni fare: $2.85 with Clipper or bank card; $3 cash or ticket machine.",
      "🔁 A regular Muni fare allows 120 minutes of travel; keep proof of payment.",
      "🚋 Cable car: $9 per ride without transfers; this is not the regular Muni streetcar fare.",
      "🎟️ The $5.70 Muni Day Pass excludes cable cars.",
      "🎟️ The $15 one-day Visitor Passport includes Muni and cable cars, not BART.",
      "💳 On BART, tap the same bank card or device in and out, one per rider.",
      "✈️ BART serves SFO; its fare depends on the journey and is separate from Muni visitor passes."
    ],
    "tips_pt": [
      "🎫 Muni regular: US$2,85 com Clipper ou cartão bancário; US$3 em dinheiro ou máquina.",
      "🔁 A tarifa regular Muni permite 120 minutos de viagem; guarde o comprovante.",
      "🚋 Cable car: US$9 por viagem, sem integração; não é a tarifa de um bonde Muni regular.",
      "🎟️ O Day Pass Muni de US$5,70 não inclui cable cars.",
      "🎟️ O Visitor Passport de um dia custa US$15 e inclui Muni e cable cars, não BART.",
      "💳 No BART, use o mesmo cartão bancário ou dispositivo ao entrar e sair, um por passageiro.",
      "✈️ O BART atende o SFO; a tarifa depende do trajeto e é separada dos passes turísticos Muni."
    ]
  },
  {
    "id": "chicago",
    "name": "Chicago",
    "state": "Illinois",
    "state_en": "Illinois",
    "state_pt": "Illinois",
    "system": "CTA L Train + Bus",
    "system_en": "CTA L Train + Bus",
    "system_pt": "CTA L Train + Ônibus",
    "price": "Tren US$2,50 · bus electrónico US$2,25 · desde O’Hare US$5",
    "price_en": "Train $2.50 · bus electronic $2.25 · from O’Hare $5",
    "price_pt": "Trem US$2,50 · ônibus eletrônico US$2,25 · saída de O’Hare US$5",
    "payment": "Ventra Card · Ventra App · tarjeta sin contacto",
    "payment_en": "Ventra Card · Ventra App · contactless card",
    "payment_pt": "Ventra Card · Ventra App · cartão sem contato",
    "app": "Ventra App ",
    "appLink": "https://www.ventrachicago.com/app/",
    "map": "https://www.transitchicago.com/maps/",
    "mapLabel": "Mapa CTA",
    "mapLabel_en": "CTA Map",
    "mapLabel_pt": "Mapa CTA",
    "gmaps": "https://maps.app.goo.gl/APbs8J3KaMrMZMV29",
    "tips_es": [
      "🎫 CTA con Ventra o pago bancario: tren US$2,50, bus US$2,25; hay tarifa especial al salir de O’Hare.",
      "🔁 CTA permite hasta 2 viajes adicionales en 2 h sin cargo con el mismo medio electrónico; efectivo no incluye transbordos.",
      "✈️ Desde O’Hare, el pasaje regular de tren cuesta US$5. Un pase ilimitado válido evita ese cargo adicional.",
      "🔵 La Blue Line conecta O’Hare con el centro y funciona las 24 h; revisa avisos de obras.",
      "🟠 Para Midway, consulta la Orange Line; a diferencia de la Blue Line, no presupongas servicio toda la noche.",
      "🎟️ El pase CTA/Pace de un día vale 24 h desde el primer uso: no vence necesariamente a medianoche.",
      "💵 En buses CTA, el efectivo requiere importe exacto; para tomar tren compra tu boleto o usa un medio sin contacto."
    ],
    "tips_en": [
      "🎫 With Ventra or bank-card payment: CTA train $2.50, bus $2.25; O’Hare departures have a special fare.",
      "🔁 CTA allows up to 2 extra rides within 2 hours free with the same electronic payment; cash fares exclude transfers.",
      "✈️ A regular train fare from O’Hare is $5; a valid unlimited-ride pass avoids the extra charge.",
      "🔵 The Blue Line links O’Hare and downtown 24 hours a day; check engineering alerts.",
      "🟠 Use the Orange Line for Midway; unlike the Blue Line, do not assume all-night service.",
      "🎟️ A CTA/Pace one-day pass lasts 24 hours from first use, rather than necessarily ending at midnight.",
      "💵 CTA buses require exact cash; for trains buy a ticket or use contactless payment."
    ],
    "tips_pt": [
      "🎫 Com Ventra ou cartão bancário: trem CTA US$2,50, ônibus US$2,25; saída de O’Hare tem tarifa especial.",
      "🔁 A CTA permite até 2 viagens extras em 2 h sem custo com o mesmo meio eletrônico; dinheiro não inclui integração.",
      "✈️ A tarifa regular de trem saindo de O’Hare é US$5; um passe ilimitado válido evita o adicional.",
      "🔵 A Blue Line liga O’Hare ao centro 24 h por dia; confira avisos de obras.",
      "🟠 Para Midway, consulte a Orange Line; diferente da Blue Line, não conte com serviço a noite toda.",
      "🎟️ O passe CTA/Pace de um dia vale 24 h desde o primeiro uso, não necessariamente até meia-noite.",
      "💵 Nos ônibus CTA, leve o valor exato; para trens compre bilhete ou use pagamento por aproximação."
    ]
  },
  {
    "id": "washington",
    "name": "Washington DC",
    "state": "DC",
    "state_en": "DC",
    "state_pt": "DC",
    "system": "Metro WMATA + Bus",
    "system_en": "WMATA Metro + Bus",
    "system_pt": "Metro WMATA + Ônibus",
    "price": "Metrorail US$2,25–6,75 · bus local US$2,25",
    "price_en": "Metrorail $2.25–$6.75 · local bus $2.25",
    "price_pt": "Metrorail US$2,25–6,75 · ônibus local US$2,25",
    "payment": "SmarTrip o tarjeta bancaria/billetera sin contacto",
    "payment_en": "SmarTrip or contactless bank card/mobile wallet",
    "payment_pt": "SmarTrip ou cartão bancário/carteira por aproximação",
    "app": "MetroPulse",
    "appLink": "https://www.wmata.com/initiatives/metropulse/index.cfm",
    "map": "https://www.wmata.com/schedules/maps/",
    "mapLabel": "Mapa Metro WMATA",
    "mapLabel_en": "WMATA Metro Map",
    "mapLabel_pt": "Mapa Metrô WMATA",
    "gmaps": "https://maps.app.goo.gl/sPaFRFAidEM3jvwW7",
    "tips_es": [
      "🎫 Metrorail regular: US$2,25–6,75 según el trayecto y el horario.",
      "🚌 El pasaje regular de bus local Metro cuesta US$2,25; no apliques esa tarifa a todas las redes de la región.",
      "💳 Puedes pagar Metro con tarjeta bancaria sin contacto o celular. En tren, usa el mismo medio para entrar y salir.",
      "✈️ Dulles (IAD) tiene Silver Line; Reagan National (DCA), Blue y Yellow. Revisa el aeropuerto de tu boleto antes de elegir ruta.",
      "🏛️ Los museos Smithsonian de Washington son gratuitos; algunos requieren pase con horario. Reserva desde el sitio del museo.",
      "🕒 El horario general de fin de semana es sábado 6:00–2:00 y domingo 6:00–medianoche; verifica último tren y obras por estación.",
      "📍 Revisa la sede exacta del museo: no todas las instalaciones Smithsonian están en el National Mall."
    ],
    "tips_en": [
      "🎫 Regular Metrorail fare: $2.25–$6.75 depending on journey and time.",
      "🚌 A regular local Metro bus fare is $2.25; other regional operators may differ.",
      "💳 Tap a bank card or phone on Metro, as on London’s Tube; on rail, use the same method in and out.",
      "✈️ Dulles (IAD) uses the Silver Line; Reagan National (DCA) uses Blue/Yellow. Check your ticket’s airport.",
      "🏛️ Washington’s Smithsonian museums are free; some require timed-entry passes. Book through the museum’s website.",
      "🕒 Usual weekend rail hours are Saturday 6 am–2 am and Sunday 6 am–midnight; check your station’s last train and works.",
      "📍 Check the exact museum location; not all Smithsonian facilities are on the National Mall."
    ],
    "tips_pt": [
      "🎫 Metrorail regular: US$2,25–6,75 conforme o trajeto e o horário.",
      "🚌 A tarifa regular do ônibus local Metro é US$2,25; outras redes da região podem cobrar diferente.",
      "💳 Pague o Metro com cartão bancário por aproximação ou celular, sem recarga de transporte; no trem, use o mesmo meio na entrada e saída.",
      "✈️ Dulles (IAD) tem Silver Line; Reagan National (DCA), Blue e Yellow. Confira o aeroporto da passagem.",
      "🏛️ Os museus Smithsonian de Washington são gratuitos; alguns exigem horário reservado. Reserve no site do museu.",
      "🕒 O horário geral é sábado 6h–2h e domingo 6h–meia-noite; confira o último trem e obras por estação.",
      "📍 Confira a unidade exata do museu; nem todas as instalações Smithsonian ficam no National Mall."
    ],
    "tips_es_AR": [
      "💳 El gesto se parece a usar la SUBE, pero Metro permite tu tarjeta bancaria sin contacto: en tren debes usarla también al salir."
    ]
  },
  {
    "id": "boston",
    "name": "Boston",
    "state": "Massachusetts",
    "state_en": "Massachusetts",
    "state_pt": "Massachusetts",
    "system": "MBTA (The T) + Bus + Ferry",
    "system_en": "MBTA (The T) + Bus + Ferry",
    "system_pt": "MBTA (The T) + Ônibus + Balsa",
    "price": "Consulta tarifas por modo en MBTA / Charlie",
    "price_en": "Check MBTA / Charlie fares for each mode",
    "price_pt": "Confira tarifas por modalidade na MBTA / Charlie",
    "payment": "Charlie: tarjeta bancaria o billetera sin contacto; consulta pases por modo",
    "payment_en": "Charlie: contactless bank card or wallet; check mode-specific passes",
    "payment_pt": "Charlie: cartão bancário ou carteira por aproximação; confira passes por modalidade",
    "app": "MBTA App",
    "appLink": "https://www.mbta.com/mbta-endorsed-apps",
    "map": "https://www.mbta.com/maps",
    "mapLabel": "Mapa MBTA",
    "mapLabel_en": "MBTA Map",
    "mapLabel_pt": "Mapa MBTA",
    "gmaps": "https://maps.app.goo.gl/qc9c4gSynjnxVdfX6",
    "tips_es": [
      "✈️ Silver Line SL1 sale gratis desde las terminales de Logan hacia South Station. No supongas que el regreso al aeropuerto también es gratis.",
      "🔵 La Blue Line sirve la estación Airport; un shuttle gratuito de Massport enlaza esa estación con las terminales.",
      "🔴 La Red Line no llega directamente a las terminales de Logan: una opción es combinar en South Station con SL1.",
      "💳 Charlie permite pago bancario sin contacto en servicios compatibles de MBTA. Consulta el modo específico: Commuter Rail tiene billetes propios.",
      "🚶 Freedom Trail recorre unos 4 km entre Boston y Charlestown. La línea roja del suelo ayuda a seguirlo.",
      "🕒 Para Freedom Trail, separa el tiempo de caminata del de visitas interiores; guarda los horarios de los lugares que más te interesan."
    ],
    "tips_en": [
      "✈️ Silver Line SL1 is free from Logan terminals to South Station; do not assume the return to the airport is also free.",
      "🔵 The Blue Line serves Airport station; a free Massport shuttle links the station with the terminals.",
      "🔴 The Red Line does not reach Logan’s terminals directly; one option is transferring to SL1 at South Station.",
      "💳 Charlie supports bank-card tapping on eligible MBTA services. Check the mode: Commuter Rail uses its own tickets.",
      "🚶 The Freedom Trail runs about 2.5 miles/4 km through Boston and Charlestown, marked by a red line.",
      "🕒 For the Freedom Trail, allow separate time for walking and indoor visits; save opening hours for your priority stops."
    ],
    "tips_pt": [
      "✈️ A Silver Line SL1 é gratuita dos terminais de Logan até South Station; não presuma que a volta ao aeroporto também seja grátis.",
      "🔵 A Blue Line atende a estação Airport; um shuttle gratuito da Massport liga a estação aos terminais.",
      "🔴 A Red Line não chega diretamente aos terminais de Logan; uma opção é fazer conexão com SL1 em South Station.",
      "💳 O Charlie aceita cartão bancário por aproximação nos serviços compatíveis da MBTA. Confira a modalidade: Commuter Rail usa bilhetes próprios.",
      "🚶 A Freedom Trail tem cerca de 4 km entre Boston e Charlestown, marcada por uma linha vermelha.",
      "🕒 Na Freedom Trail, separe o tempo de caminhada do de visitas internas; salve os horários dos locais prioritários."
    ]
  },
  {
    "id": "seattle",
    "name": "Seattle",
    "state": "Washington",
    "state_en": "Washington",
    "state_pt": "Washington",
    "system": "Link Light Rail + Bus + Monorail",
    "system_en": "Link Light Rail + Bus + Monorail",
    "system_pt": "Link Light Rail + Ônibus + Monotrilho",
    "price": "Link adulto US$3 · otros servicios según operador",
    "price_en": "Adult Link $3 · other services vary by operator",
    "price_pt": "Link adulto US$3 · outros serviços conforme a operadora",
    "payment": "ORCA o boleto del operador; revisa el medio admitido",
    "payment_en": "ORCA or operator ticket; check accepted payment",
    "payment_pt": "ORCA ou bilhete da operadora; confira meios aceitos",
    "app": "OneBusAway / ORCA",
    "appLink": "https://opentransitsoftwarefoundation.org/onebusaway",
    "map": "https://www.soundtransit.org/get-to-know-us/maps",
    "mapLabel": "Mapa Sound Transit",
    "mapLabel_en": "Sound Transit Map",
    "mapLabel_pt": "Mapa Sound Transit",
    "gmaps": "https://maps.app.goo.gl/nWWm2XAQfqHtuyV18",
    "tips_es": [
      "🚆 Link 1 y 2: tarifa adulta regular US$3 por viaje; no depende de la distancia.",
      "💳 ORCA permite transbordos entre servicios participantes; no confundas ORCA en el celular con cualquier tarjeta bancaria.",
      "📱 Con ORCA, valida al subir a Link. El operador indica que ya no es necesario validar al bajar de Link o bus.",
      "✈️ Para llegar a la estación SeaTac/Airport desde la terminal, sigue el recorrido peatonal por el estacionamiento; añade ese tiempo al trayecto.",
      "🎟️ El pase regional ORCA de US$6 cubre viajes participantes de hasta US$3; servicios más caros pueden requerir saldo adicional.",
      "🕒 Antes de elegir un viaje nocturno al aeropuerto, revisa el horario de la estación y deja margen para caminar hasta la terminal."
    ],
    "tips_en": [
      "🚆 Link 1/2 Line regular adult fare is $3 per trip, regardless of distance.",
      "💳 ORCA supports transfers across participating services; a mobile ORCA card is different from an ordinary bank card.",
      "📱 With ORCA, tap before boarding Link; the operator says you no longer need to tap off Link or buses.",
      "✈️ Follow the walkway through the airport garage to SeaTac/Airport station; add that walk to your journey time.",
      "🎟️ The $6 regional ORCA day pass covers eligible rides up to $3; higher fares may need extra stored value.",
      "🕒 Before choosing a late airport train, check station times and allow for the walk to the terminal."
    ],
    "tips_pt": [
      "🚆 Link linhas 1 e 2: tarifa regular de adulto US$3 por viagem, sem depender da distância.",
      "💳 O ORCA permite integração entre serviços participantes; ORCA no celular não é o mesmo que qualquer cartão bancário.",
      "📱 Com ORCA, valide antes de embarcar no Link; a operadora informa que não é mais necessário validar ao sair do Link ou ônibus.",
      "✈️ Siga a passagem pelo estacionamento até a estação SeaTac/Airport; inclua essa caminhada no tempo de trajeto.",
      "🎟️ O passe regional ORCA de US$6 cobre viagens participantes de até US$3; serviços mais caros podem exigir saldo extra.",
      "🕒 Antes de escolher um trem noturno ao aeroporto, confira os horários e reserve tempo para caminhar até o terminal."
    ]
  },
  {
    "id": "neworleans",
    "name": "New Orleans",
    "state": "Luisiana",
    "state_en": "Louisiana",
    "state_pt": "Louisiana",
    "system": "RTA Streetcar + Bus",
    "system_en": "RTA Streetcar + Bus",
    "system_pt": "RTA Bondinho + Ônibus",
    "price": "Bus/streetcar US$1,25 · pase de un día US$3",
    "price_en": "Bus/streetcar $1.25 · one-day pass $3",
    "price_pt": "Ônibus/streetcar US$1,25 · passe de um dia US$3",
    "payment": "Le Pass, Jazzy Pass o efectivo según servicio",
    "payment_en": "Le Pass, Jazzy Pass or cash depending on service",
    "payment_pt": "Le Pass, Jazzy Pass ou dinheiro conforme o serviço",
    "app": "Le Pass",
    "appLink": "https://www.norta.com/ride-with-us/how-to-pay/lepass",
    "map": "https://www.norta.com/rider-tools/",
    "mapLabel": "Mapa RTA NOLA",
    "mapLabel_en": "RTA NOLA Map",
    "mapLabel_pt": "Mapa RTA NOLA",
    "gmaps": "https://maps.app.goo.gl/YLypuZTjNXZLt3Fk6",
    "tips_es": [
      "🎫 RTA: bus o streetcar regular US$1,25 por viaje; pase de un día US$3.",
      "📱 Usa Le Pass para comprar y validar pasajes de bus, streetcar y ferry; reemplaza la antigua referencia a GoMobile.",
      "🚋 Para explorar St. Charles Avenue y el área del Garden District, revisa la ruta St. Charles y sus avisos de servicio.",
      "🌳 Las rutas Canal/Cemeteries y Canal/City Park tienen destinos distintos; revisa el cartel antes de subir.",
      "🗺️ En Le Pass puedes consultar recorridos y ubicación del transporte; revisa el regreso antes de alejarte del centro.",
      "🎭 Si viajas durante un desfile o evento, consulta desvíos RTA: un streetcar puede ser reemplazado temporalmente por bus.",
      "🎟️ Compara el pase con tus viajes efectivos y transbordos; no lo justifiques contando cada cambio de vehículo como otro pasaje completo."
    ],
    "tips_en": [
      "🎫 RTA regular bus/streetcar fare is $1.25; a one-day pass costs $3.",
      "📱 Use Le Pass to buy and validate bus, streetcar and ferry tickets; it replaces the old GoMobile reference.",
      "🚋 For St. Charles Avenue and the Garden District area, check the St. Charles route and its service alerts.",
      "🌳 Canal/Cemeteries and Canal/City Park have different destinations; check the sign before boarding.",
      "🗺️ Le Pass provides route planning and live vehicle information; check the return before travelling beyond downtown.",
      "🎭 During parades or events, check RTA detours; a streetcar may be temporarily replaced by buses.",
      "🎟️ Compare a pass against actual paid trips and transfer rules, rather than treating every vehicle change as a full fare."
    ],
    "tips_pt": [
      "🎫 RTA: ônibus ou streetcar regular US$1,25; passe de um dia US$3.",
      "📱 Use Le Pass para comprar e validar passagens de ônibus, streetcar e ferry; ele substitui a antiga referência ao GoMobile.",
      "🚋 Para St. Charles Avenue e a região do Garden District, confira a rota St. Charles e os avisos de serviço.",
      "🌳 Canal/Cemeteries e Canal/City Park têm destinos diferentes; confira a placa antes de embarcar.",
      "🗺️ O Le Pass oferece planejamento e informações em tempo real; confira a volta antes de se afastar do centro.",
      "🎭 Durante desfiles ou eventos, confira os desvios RTA; um streetcar pode ser substituído temporariamente por ônibus.",
      "🎟️ Compare o passe com as viagens pagas e as regras de integração, sem contar toda troca de veículo como tarifa cheia."
    ]
  },
  {
    "id": "denver",
    "name": "Denver",
    "state": "Colorado",
    "state_en": "Colorado",
    "state_pt": "Colorado",
    "system": "RTD Bus + Light Rail + A Line",
    "system_en": "RTD Bus + Light Rail + A Line",
    "system_pt": "RTD Ônibus + Light Rail + Linha A",
    "price": "US$2,75/3 h · US$5,50/día · Airport Day Pass US$10",
    "price_en": "$2.75/3 hr · $5.50/day · Airport Day Pass $10",
    "price_pt": "US$2,75/3 h · US$5,50/dia · Airport Day Pass US$10",
    "payment": "MyRide o boleto RTD; consulta opciones por servicio",
    "payment_en": "MyRide or RTD ticket; check options for each service",
    "payment_pt": "MyRide ou bilhete RTD; confira opções por serviço",
    "app": "RTD MyRide App",
    "appLink": "https://www.rtd-denver.com/es/fares-passes/myride",
    "map": "https://www.rtd-denver.com/system-map",
    "mapLabel": "Mapa RTD Denver",
    "mapLabel_en": "RTD Denver Map",
    "mapLabel_pt": "Mapa RTD Denver",
    "gmaps": "https://maps.app.goo.gl/5VbCJVJt9cmx8fLJ8",
    "tips_es": [
      "🎫 RTD regular: US$2,75 por 3 h y US$5,50 por día; el aeropuerto requiere la tarifa correspondiente.",
      "✈️ El Airport Day Pass regular cuesta US$10 e incluye el sistema RTD durante el día de servicio, también el aeropuerto.",
      "🚆 La A Line conecta DEN con Union Station en unos 37 minutos; añade el tiempo para llegar al andén.",
      "🚌 El shuttle FreeRide de 16th Street es gratuito. Revisa sus paradas y cualquier desvío del día.",
      "🔁 Union Station reúne conexiones de tren y bus. Calcula la caminata al siguiente andén cuando combines servicios.",
      "🎟️ El Day Pass regular de US$5,50 no incluye el aeropuerto; no lo confundas con el Airport Day Pass.",
      "🏔️ Para una excursión a la montaña, comprueba el servicio hasta el destino final y la vuelta: llegar a una estación no garantiza el traslado hasta el sendero."
    ],
    "tips_en": [
      "🎫 Standard RTD fares: $2.75 for 3 hours or $5.50 for a day; airport travel needs the appropriate fare.",
      "✈️ The standard $10 Airport Day Pass covers the RTD system for the service day, including the airport.",
      "🚆 The A Line links DEN and Union Station in about 37 minutes; add time to reach the platform.",
      "🚌 The 16th Street FreeRide shuttle is free; check its stops and current detours.",
      "🔁 Union Station connects rail and bus services; allow for walking to your next boarding point.",
      "🎟️ The standard $5.50 Day Pass excludes the airport; it differs from the Airport Day Pass.",
      "🏔️ For a mountain trip, check service all the way to the destination and back; reaching a station does not guarantee a trailhead connection."
    ],
    "tips_pt": [
      "🎫 RTD regular: US$2,75 por 3 h ou US$5,50 por dia; aeroporto exige a tarifa correspondente.",
      "✈️ O Airport Day Pass regular custa US$10 e inclui o sistema RTD no dia de serviço, inclusive aeroporto.",
      "🚆 A A Line liga DEN a Union Station em cerca de 37 minutos; acrescente o tempo até a plataforma.",
      "🚌 O shuttle FreeRide da 16th Street é gratuito; confira os pontos e desvios do dia.",
      "🔁 Union Station reúne conexões de trem e ônibus; reserve tempo para caminhar até o próximo embarque.",
      "🎟️ O Day Pass regular de US$5,50 não inclui o aeroporto; é diferente do Airport Day Pass.",
      "🏔️ Para um passeio na montanha, confira o trajeto completo e a volta; chegar à estação não garante conexão até a trilha."
    ]
  }
];

function cityTipsFor(city, lang) {
  const base = city["tips_" + lang] || city.tips_es;
  if (lang !== "es") return base;
  let country = "";
  try { country = (localStorage.getItem("appCountry") || "").toUpperCase(); } catch (_) {}
  const extra = city["tips_es_" + country];
  return Array.isArray(extra) ? base.concat(extra) : base;
}

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
  const tips = cityTipsFor(city, lang);
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
