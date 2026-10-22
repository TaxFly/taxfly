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
      "🚂 SunRail opera habitualmente de lunes a viernes; no cuentes con trenes regulares de fin de semana. Revisa servicios especiales.",
      "🚄 La estación Brightline de Orlando está en MCO, junto a la Terminal C. Reserva tiempo para llegar desde tu hotel o parque.",
      "🎢 En Magic Kingdom, el estacionamiento y la bajada habitual de Uber/Lyft están en el TTC. Desde allí todavía debes tomar monorriel o ferry hasta la entrada; añade ese tramo al tiempo de llegada.",
      "🚗 Si retiras y devuelves un auto de una rentadora participante en MCO, evalúa Visitor Toll Pass. Se reserva sin cargo adicional al peaje; para evitar cobro doble debes rechazar el programa de peajes de la rentadora.",
      "🛍️ Disney Springs tiene estacionamiento estándar gratuito, pero no es un atajo garantizado a los parques. Para sus buses a hoteles pueden pedir prueba de hospedaje o reserva válida de comida/experiencia.",
      "Disney World tiene cuatro parques temáticos: Magic Kingdom, EPCOT, Hollywood Studios y Animal Kingdom. Antes de comprar, arma el calendario por parque y confirma qué días y accesos cubre tu entrada.",
      "Universal Orlando: compara entradas según los parques que quieras visitar: Universal Studios Florida, Islands of Adventure, Epic Universe y el acuático Volcano Bay. Comprueba que tu producto incluya Epic Universe y las fechas elegidas; el nombre “Universal” por sí solo no alcanza.",
      "Hogwarts Express une Diagon Alley en Universal Studios Florida con Hogsmeade en Islands of Adventure. Necesitas una entrada con acceso Park-to-Park entre esos dos parques; revisa también los cierres de la atracción antes de organizar el día.",
      "SeaWorld Orlando: Quick Queue se paga aparte y no incluye entrada al parque. Revisa las atracciones participantes y las alturas mínimas antes de comprarlo; no cubre automáticamente todas las atracciones.",
      "SeaWorld Orlando: si compras Reserved Seating para presentaciones, las condiciones exigen llegar 30 minutos antes. Reserva ese bloque en tu recorrido; pagar el asiento no permite llegar justo al inicio ni garantiza la primera fila.",
      "LEGOLAND Florida queda en Winter Haven: planifica el traslado completo desde Orlando antes de comprar. Su Water Park está dentro del parque temático, requiere una entrada que incluya ese acceso y tiene calendario propio; comprueba que abra en tu fecha.",
      "Kennedy Space Center: el Bus Tour al Apollo/Saturn V Center está incluido en la entrada. La web recomienda unas 3 horas y el último bus sale 2 horas y media antes del cierre; confirma el horario del día y no dejes ese recorrido para el final.",
      "Kennedy Space Center no ofrece traslado propio desde Orlando. Organiza ida y vuelta por separado o revisa si tu excursión las incluye. Si eliges el día por un lanzamiento, ten un plan alternativo: el horario puede cambiar o cancelarse incluso a último momento."
    ],
    "tips_en": [
      "🚌 LYNX regular fare is $2; an all-day pass costs $4.50.",
      "🎫 Ask for a LYNX transfer when boarding: valid 90 minutes, excluding return trips and the same route.",
      "🚎 I-RIDE Trolley adult fare is $2 per ride; have exact cash, as drivers give no change.",
      "🚂 SunRail normally runs Monday–Friday; do not assume regular weekend trains. Check for special services.",
      "🚄 Orlando’s Brightline station is at MCO beside Terminal C; allow time to get there from your hotel or park.",
      "🎢 Magic Kingdom parking and the usual Uber/Lyft drop-off are at the TTC. You still need the monorail or ferry to the park entrance; allow for that extra leg.",
      "🚗 If collecting and returning a participating rental car at MCO, consider Visitor Toll Pass. There is no added toll-program fee; decline the rental firm’s toll programme to avoid double billing.",
      "🛍️ Disney Springs has free standard parking, but is not a guaranteed park-access shortcut. Resort buses may require proof of a hotel stay or valid dining/experience reservation.",
      "Disney World has four theme parks: Magic Kingdom, EPCOT, Hollywood Studios and Animal Kingdom. Plan your days by park before buying, then check which dates and park access your ticket covers.",
      "Universal Orlando: compare tickets for the parks you want—Universal Studios Florida, Islands of Adventure, Epic Universe and the Volcano Bay water park. Check that your product includes Epic Universe and your chosen dates; the Universal name alone is not enough.",
      "Hogwarts Express links Diagon Alley in Universal Studios Florida with Hogsmeade in Islands of Adventure. You need Park-to-Park access between those two parks; check attraction closures before planning your day around the train.",
      "SeaWorld Orlando: Quick Queue costs extra and excludes park admission. Check participating rides and minimum heights before buying; it does not automatically cover every attraction.",
      "SeaWorld Orlando: Reserved Seating for presentations requires arrival 30 minutes before showtime. Allow that block in your route; paying for a seat does not allow last-minute arrival or guarantee the front row.",
      "LEGOLAND Florida is in Winter Haven: plan the full journey from Orlando before buying. Its Water Park is inside the theme park, requires a ticket including that access and has its own calendar; check that it opens on your date.",
      "Kennedy Space Center: the Bus Tour to the Apollo/Saturn V Center is included with admission. The official guide allows about 3 hours; the last bus leaves 2.5 hours before closing. Check the daily schedule and do not leave it until the end.",
      "Kennedy Space Center does not provide its own transport from Orlando. Arrange a return journey or check that your excursion includes it. If visiting for a launch, keep a backup plan: launch times can change or be scrubbed at the last minute."
    ],
    "tips_pt": [
      "🚌 LYNX: tarifa regular US$2; passe diário US$4,50.",
      "🎫 Peça a integração LYNX ao embarcar: vale 90 minutos, sem volta nem repetição da mesma linha.",
      "🚎 I-RIDE Trolley: US$2 por viagem de adulto; leve o valor exato, pois o motorista não dá troco.",
      "🚂 O SunRail opera normalmente de segunda a sexta; não conte com trens regulares no fim de semana. Confira serviços especiais.",
      "🚄 A estação Brightline de Orlando fica no MCO, junto ao Terminal C. Reserve tempo para sair do hotel ou parque.",
      "🎢 O estacionamento e o desembarque habitual de Uber/Lyft para Magic Kingdom ficam no TTC. Ainda é preciso pegar monorail ou ferry até a entrada; inclua esse trecho no tempo de chegada.",
      "🚗 Se retirar e devolver carro de locadora participante no MCO, avalie o Visitor Toll Pass. Não há tarifa adicional do programa; recuse o programa de pedágio da locadora para evitar cobrança dupla.",
      "🛍️ O estacionamento padrão de Disney Springs é gratuito, mas não é um atalho garantido aos parques. Ônibus aos hotéis podem exigir comprovação de hospedagem ou reserva válida de refeição/experiência.",
      "O Disney World tem quatro parques temáticos: Magic Kingdom, EPCOT, Hollywood Studios e Animal Kingdom. Organize os dias por parque antes de comprar e confira as datas e os acessos incluídos no ingresso.",
      "Universal Orlando: compare ingressos para os parques desejados — Universal Studios Florida, Islands of Adventure, Epic Universe e o aquático Volcano Bay. Confira se o produto inclui Epic Universe e as datas escolhidas; só o nome Universal não basta.",
      "O Hogwarts Express liga Diagon Alley no Universal Studios Florida a Hogsmeade no Islands of Adventure. É preciso acesso Park-to-Park entre esses dois parques; confira também os fechamentos da atração antes de organizar o dia.",
      "SeaWorld Orlando: Quick Queue é pago à parte e não inclui entrada no parque. Confira as atrações participantes e alturas mínimas antes de comprar; ele não cobre automaticamente todas as atrações.",
      "SeaWorld Orlando: o Reserved Seating para apresentações exige chegada 30 minutos antes. Reserve esse intervalo no roteiro; pagar pelo assento não permite chegar no início nem garante a primeira fila.",
      "O LEGOLAND Florida fica em Winter Haven: planeje o trajeto completo desde Orlando antes de comprar. O Water Park fica dentro do parque temático, exige ingresso com esse acesso e tem calendário próprio; confira se abre na sua data.",
      "Kennedy Space Center: o Bus Tour ao Apollo/Saturn V Center está incluído no ingresso. O guia oficial recomenda cerca de 3 horas; o último ônibus sai 2 horas e meia antes do fechamento. Confira a programação do dia e não deixe para o final.",
      "O Kennedy Space Center não oferece transporte próprio desde Orlando. Organize ida e volta ou confira se sua excursão as inclui. Se escolher a data por um lançamento, tenha um plano alternativo: o horário pode mudar ou o lançamento ser cancelado na última hora."
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
      "✈️ AirTrain JFK se paga aparte del metro o LIRR. Compara el viaje completo, no solo la tarifa del tren urbano.",
      "⛴️ El Staten Island Ferry de NYC DOT es gratuito entre Lower Manhattan y Staten Island. No es un desembarco en Liberty Island.",
      "🚇 OMNY: metro y buses locales cuestan US$3, con tope de US$35 en 7 días. Usa siempre la misma tarjeta o dispositivo: la tarjeta física y su versión en el celular acumulan por separado.",
      "👥 Puedes pagar hasta 3 acompañantes con OMNY, pero solo tu primer toque suma a tu tope. Para que cada viajero acumule el suyo, debe usar su propio medio de pago.",
      "🖼️ The Met no ofrece “paga lo que quieras” a todo turista. Esa modalidad tiene requisitos de residencia o estudios; la entrada general incluye ambas sedes el mismo día, no varios días.",
      "🗽 Para desembarcar en Liberty Island, compra el ferry autorizado de Statue City Cruises. Acceso general, pedestal y corona son modalidades distintas; la corona requiere reserva anticipada y no tiene ascensor.",
      "🏙️ El Memorial del 11-S al aire libre es gratuito y no exige comprar la entrada del museo. El museo interior es otra visita y requiere boleto.",
      "Intrepid Museum: la entrada general incluye el Space Shuttle Pavilion, donde está el Enterprise, y el submarino Growler. Comprueba aparte las experiencias adicionales que quieras; no compres otro producto solo para ver el transbordador."
    ],
    "tips_en": [
      "✈️ JFK AirTrain costs extra on top of subway or LIRR fares; compare the full journey.",
      "⛴️ NYC DOT’s Staten Island Ferry is free between Lower Manhattan and Staten Island; it does not stop on Liberty Island.",
      "🚇 OMNY: subway/local buses cost $3, capped at $35 over seven days. Keep the same card or device: plastic and its mobile-wallet version build separate caps.",
      "👥 OMNY lets you pay for up to 3 companions, but only the first tap builds your cap. Each traveller needs a separate payment method to build their own.",
      "🖼️ The Met’s pay-what-you-wish admission is limited by residence/student eligibility, not available to every tourist. General admission covers both locations on the same day, not multiple days.",
      "🗽 To land on Liberty Island, use authorised Statue City Cruises. General admission, pedestal and crown are different options; the crown needs advance booking and has no lift.",
      "🏙️ The outdoor 9/11 Memorial is free without a Museum ticket. The indoor Museum is a separate, ticketed visit.",
      "Intrepid Museum: general admission includes the Space Shuttle Pavilion, home to Enterprise, and the submarine Growler. Check any extra experiences separately; you do not need another product just to see the shuttle."
    ],
    "tips_pt": [
      "✈️ O AirTrain JFK é pago separadamente do metrô ou LIRR; compare o trajeto completo.",
      "⛴️ O Staten Island Ferry da NYC DOT é gratuito entre Lower Manhattan e Staten Island; não desembarca na Liberty Island.",
      "🚇 OMNY: metrô e ônibus locais custam US$3, com teto de US$35 em 7 dias. Use o mesmo cartão ou dispositivo: o físico e a versão no celular acumulam separadamente.",
      "👥 O OMNY permite pagar até 3 acompanhantes, mas só o primeiro toque soma ao seu teto. Para cada pessoa acumular o próprio, use meios de pagamento separados.",
      "🖼️ O “pague quanto quiser” do Met exige residência ou condição estudantil elegível; não vale para todo turista. O ingresso geral inclui as duas unidades no mesmo dia, não em vários dias.",
      "🗽 Para desembarcar na Liberty Island, use o ferry autorizado Statue City Cruises. Acesso geral, pedestal e coroa são modalidades diferentes; a coroa exige reserva antecipada e não tem elevador.",
      "🏙️ O Memorial do 11 de Setembro ao ar livre é gratuito, sem ingresso do museu. O museu interno é uma visita separada e exige bilhete.",
      "Intrepid Museum: o ingresso geral inclui o Space Shuttle Pavilion, onde está o Enterprise, e o submarino Growler. Confira separadamente as experiências extras desejadas; não é preciso outro produto só para ver o ônibus espacial."
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
      "💳 Metrorail/Metrobus regular: US$2,25. Con tarjeta bancaria sin contacto, el tope diario es US$5,65 usando siempre el mismo medio; Metromover es gratuito.",
      "✈️ Desde MIA, toma el MIA Mover gratuito hasta el centro de transporte y allí la Orange Line de Metrorail. No confundas ese primer traslado con el Metromover del centro.",
      "🏖️ Dentro de Miami Beach, el trolley municipal es gratuito y funciona normalmente de 8:00 a 23:00. Revisa la ruta de South Beach, Mid Beach o North Beach que te corresponda.",
      "🚎 El trolley de Coral Gables es gratuito y tiene rutas Ponce de Leon y Grand Avenue. Es otra red: no lo confundas con el trolley de Miami Beach.",
      "🎨 Wynwood Walls es un museo con política de entradas propia. La gratuidad anunciada para residentes de Miami-Dade exige identificación local y no se extiende automáticamente a visitantes extranjeros.",
      "🔁 Conserva el mismo medio electrónico al combinar Metrorail y Metrobus para aplicar beneficios de transbordo. Pagar cada bus en efectivo puede hacerte perder esa integración.",
      "📍 Miami Beach está al otro lado de la bahía: un hotel en Downtown o junto a MIA no es un hotel en South Beach. Comprueba el trayecto real antes de elegir alojamiento por precio.",
      "Everglades desde Miami: si eliges Shark Valley, suma la entrada del parque nacional y el tram o alquiler de bicicleta, que se pagan aparte. Define primero ese acceso concreto; una excursión anunciada como “Everglades” puede visitar otra zona."
    ],
    "tips_en": [
      "💳 Regular Metrorail/Metrobus fare is $2.25. The daily contactless bank-card cap is $5.65 with the same payment method; Metromover is free.",
      "✈️ From MIA, take the free MIA Mover to the transport centre, then Metrorail’s Orange Line. That airport shuttle is different from downtown Metromover.",
      "🏖️ Within Miami Beach, the city trolley is free and normally runs 8 am–11 pm. Choose the appropriate South Beach, Mid Beach or North Beach route.",
      "🚎 Coral Gables’ free trolley has Ponce de Leon and Grand Avenue routes. It is a separate network from Miami Beach’s trolley.",
      "🎨 Wynwood Walls is a museum with its own admission policy. Miami-Dade resident free entry requires local photo ID and does not automatically include overseas visitors.",
      "🔁 Keep the same electronic payment method for Metrorail/Metrobus transfer benefits; paying each bus in cash can lose those benefits.",
      "📍 Miami Beach is across the bay: a Downtown or MIA-area hotel is not in South Beach. Check the actual journey before choosing a hotel on price.",
      "Everglades from Miami: for Shark Valley, budget for national park entry plus the tram or bike rental, charged separately. Choose the specific entrance first; a tour advertised simply as Everglades may visit a different area."
    ],
    "tips_pt": [
      "💳 Metrorail/Metrobus regular: US$2,25. Com o mesmo cartão bancário por aproximação, o teto diário é US$5,65; Metromover é gratuito.",
      "✈️ No MIA, pegue o MIA Mover gratuito até o centro de transporte e depois a Orange Line do Metrorail. Não confunda com o Metromover do centro.",
      "🏖️ Dentro de Miami Beach, o trolley municipal é gratuito e funciona normalmente das 8h às 23h. Escolha a rota adequada a South Beach, Mid Beach ou North Beach.",
      "🚎 O trolley gratuito de Coral Gables tem rotas Ponce de Leon e Grand Avenue. É outra rede, diferente do trolley de Miami Beach.",
      "🎨 Wynwood Walls é um museu com política própria de ingresso. A gratuidade para residentes de Miami-Dade exige documento local e não vale automaticamente para turistas brasileiros.",
      "🔁 Use o mesmo meio eletrônico para integração entre Metrorail e Metrobus; pagar cada ônibus em dinheiro pode perder o benefício.",
      "📍 Miami Beach fica do outro lado da baía: hotel em Downtown ou perto do MIA não é em South Beach. Confira o trajeto real antes de escolher só pelo preço.",
      "Everglades desde Miami: em Shark Valley, some a entrada do parque nacional ao tram ou aluguel de bicicleta, cobrados à parte. Defina primeiro esse acesso; uma excursão anunciada apenas como Everglades pode visitar outra área."
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
      "⛲ Ver las fuentes de Bellagio desde el exterior es gratuito. El espectáculo puede cancelarse por clima; no compres una entrada solo para ver las fuentes públicas.",
      "💡 The Neon Museum vende modalidades diurnas y nocturnas diferentes. Si tu objetivo es fotografiar los carteles iluminados, elige la sesión correspondiente antes de pagar.",
      "Sphere: elige primero la película o concierto que quieres y después la fecha y el asiento. La programación vende funciones concretas; revisa el nombre del evento antes de pagar para no confundir una experiencia de cine con un concierto."
    ],
    "tips_en": [
      "🎫 Deuce/Strip & All Access passes: $6 for 2 hours, $8 for 24 hours, $20 for 3 days.",
      "🚌 For the Strip, choose the Strip & All Access fare rather than automatically budgeting a residential fare.",
      "✈️ Airport RTC routes depend on terminal and destination; do not assume the Deuce stops at your terminal.",
      "🚝 The Monorail sells its own tickets; do not assume your RTC bus pass includes it. Compare routes.",
      "⛲ Watching the Bellagio fountains from outside is free. Shows may be cancelled for weather; no attraction ticket is needed for the public fountain display.",
      "💡 The Neon Museum sells different daytime and evening admissions. If you want illuminated-sign photos, choose the corresponding session before buying.",
      "Sphere: choose the film or concert first, then the date and seat. Tickets are for specific performances; check the event name before paying so you do not confuse a film experience with a concert."
    ],
    "tips_pt": [
      "🎫 Deuce/Strip & All Access: US$6 por 2 h, US$8 por 24 h e US$20 por 3 dias.",
      "🚌 Para o Strip, escolha a tarifa Strip & All Access; não conte automaticamente com a tarifa residencial.",
      "✈️ As rotas RTC do aeroporto dependem do terminal e do destino; não presuma que o Deuce passe no terminal.",
      "🚝 O Monorail vende bilhetes próprios; não presuma que esteja incluído no passe de ônibus RTC.",
      "⛲ Assistir às fontes do Bellagio pelo lado de fora é gratuito. O show pode ser cancelado por clima; não é necessário ingresso para o espetáculo público.",
      "💡 O Neon Museum vende ingressos diurnos e noturnos diferentes. Se quiser fotografar os letreiros iluminados, escolha a sessão correspondente antes de pagar.",
      "Sphere: escolha primeiro o filme ou show desejado, depois a data e o assento. Os ingressos são para sessões específicas; confira o nome do evento antes de pagar para não confundir uma experiência de cinema com um show."
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
      "🚇 La línea B conecta Union Station con North Hollywood; consulta la parada de Hollywood que corresponde a tu visita.",
      "🏖️ La línea E llega a Santa Monica. Revisa el destino y las conexiones del tren, no solo los antiguos nombres de colores.",
      "🚇 Metro regular cuesta US$1,75. Con el mismo TAP, tarjeta bancaria o dispositivo compatible, acumulas topes de US$5 al día y US$18 en 7 días; el efectivo no los acumula.",
      "🔁 Metro incluye transbordos por 2 h al pagar con TAP o tarjeta compatible, pero no viajes de ida y vuelta. Si pagas el bus en efectivo, lleva el importe exacto.",
      "✈️ LAX FlyAway conecta el aeropuerto con Union Station y Van Nuys. Si compras boleto móvil, actívalo al embarcar: después de activarlo tiene una validez limitada, no desde cualquier momento de tu viaje.",
      "🖼️ El Getty Center tiene entrada gratuita con reserva de horario, pero el estacionamiento se cobra aparte. No confundas la reserva del museo con estacionamiento gratuito ni con el Getty Villa.",
      "🔭 El edificio, los jardines y los telescopios públicos de Griffith Observatory son gratuitos. Los shows del planetario y el estacionamiento tienen cobro separado.",
      "Disneyland Resort en California tiene Disneyland Park y Disney California Adventure. A partir de 3 años se requiere entrada válida y reserva para el mismo parque y fecha: confirma ambas antes de cerrar el traslado.",
      "Universal Studios Hollywood: distingue el ticket Universal Express, que incluye entrada de un día, del Express Add-On, que requiere comprar la entrada aparte. Revisa las atracciones excluidas y la fecha del producto antes de pagar.",
      "Knott’s Berry Farm y el acuático vecino Soak City tienen accesos distintos. Soak City requiere entrada propia o un producto que lo incluya y abre por temporada, en fechas seleccionadas; revisa su calendario antes de añadirlo al mismo día."
    ],
    "tips_en": [
      "🚇 The B Line connects Union Station with North Hollywood; choose the Hollywood stop for your destination.",
      "🏖️ The E Line reaches Santa Monica; check destinations and connections rather than relying on old colour names.",
      "🚇 Metro’s regular fare is $1.75. The same eligible TAP, bank card or device earns caps of $5 per day and $18 over seven days; cash does not.",
      "🔁 TAP or eligible card payment includes Metro transfers for 2 hours, excluding round trips. Cash bus payment needs the exact fare.",
      "✈️ LAX FlyAway serves Union Station and Van Nuys. Activate a mobile ticket when boarding: activation starts a limited validity window.",
      "🖼️ Getty Center admission is free with a timed reservation, but parking is charged separately. A museum booking is not free parking or a Getty Villa reservation.",
      "🔭 Griffith Observatory’s building, grounds and public telescopes are free. Planetarium shows and parking are charged separately.",
      "California’s Disneyland Resort has Disneyland Park and Disney California Adventure. Guests aged 3 and over need valid admission and a reservation for the same park and date: confirm both before booking transport.",
      "Universal Studios Hollywood: distinguish the Universal Express ticket, which includes one-day admission, from the Express Add-On, which requires separate admission. Check excluded attractions and the product date before paying.",
      "Knott’s Berry Farm and the neighbouring Soak City water park have separate gates. Soak City needs its own admission or a product including it and opens seasonally on selected dates; check its calendar before adding it to the same day."
    ],
    "tips_pt": [
      "🚇 A linha B liga Union Station a North Hollywood; confira a estação de Hollywood adequada ao passeio.",
      "🏖️ A linha E chega a Santa Monica; confira destinos e conexões, em vez de depender dos antigos nomes por cor.",
      "🚇 A tarifa regular Metro é US$1,75. Com o mesmo TAP, cartão bancário ou dispositivo compatível, os tetos são US$5 por dia e US$18 em 7 dias; dinheiro não acumula.",
      "🔁 TAP ou cartão compatível inclui integração Metro por 2 h, sem ida e volta. No pagamento em dinheiro no ônibus, leve o valor exato.",
      "✈️ O LAX FlyAway liga o aeroporto a Union Station e Van Nuys. Ative o bilhete móvel ao embarcar: a ativação inicia um prazo limitado de validade.",
      "🖼️ O Getty Center tem entrada gratuita com horário reservado, mas estacionamento pago à parte. A reserva não inclui estacionamento grátis nem visita ao Getty Villa.",
      "🔭 O prédio, os jardins e os telescópios públicos do Griffith Observatory são gratuitos. Shows do planetário e estacionamento são cobrados à parte.",
      "O Disneyland Resort na Califórnia tem Disneyland Park e Disney California Adventure. A partir de 3 anos, é preciso ingresso válido e reserva para o mesmo parque e data: confirme ambos antes de fechar o transporte.",
      "Universal Studios Hollywood: diferencie o ingresso Universal Express, que inclui entrada de um dia, do Express Add-On, que exige ingresso de entrada separado. Confira as atrações excluídas e a data do produto antes de pagar.",
      "Knott’s Berry Farm e o aquático vizinho Soak City têm acessos separados. O Soak City exige ingresso próprio ou produto que o inclua e abre por temporada em datas selecionadas; confira o calendário antes de incluí-lo no mesmo dia."
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
      "🚋 Cable car: US$9 por viaje, sin transbordo incluido. No es la misma tarifa que un tranvía Muni regular.",
      "💳 En BART puedes pagar con tarjeta bancaria sin contacto; usa el mismo medio al entrar y salir, uno por viajero.",
      "✈️ BART llega a SFO; su tarifa depende del trayecto y se paga aparte de los pases turísticos Muni.",
      "🎫 Muni regular: US$2,85 con Clipper o tarjeta bancaria y US$3 en efectivo, con 120 minutos de viaje. Los cable cars tienen tarifa propia.",
      "🎟️ Si quieres cable cars, compara el Visitor Passport de un día (US$15) con el Day Pass Muni (US$5,70): solo el primero los incluye. Ninguno sustituye el boleto BART al aeropuerto.",
      "🏝️ Para desembarcar en Alcatraz necesitas ferry de Alcatraz City Cruises, el operador autorizado por NPS. Un crucero que solo pasa junto a la isla no permite visitar la prisión.",
      "🚗 El Golden Gate cobra peaje solo al conducir hacia San Francisco y no acepta efectivo en el puente. Si alquilas auto, acuerda cómo pagarlo antes de cruzar para evitar comisiones inesperadas.",
      "California Academy of Sciences: NightLife es solo para personas de 21 años o más y exige identificación física válida con foto. Sus pases de planetario se venden aparte; para una visita con menores, elige la programación diurna."
    ],
    "tips_en": [
      "🚋 Cable car: $9 per ride without transfers; this is not the regular Muni streetcar fare.",
      "💳 On BART, tap the same bank card or device in and out, one per rider.",
      "✈️ BART serves SFO; its fare depends on the journey and is separate from Muni visitor passes.",
      "🎫 Regular Muni fare is $2.85 with Clipper/bank card or $3 cash, allowing 120 minutes of travel. Cable cars have a separate fare.",
      "🎟️ For cable cars, compare the $15 one-day Visitor Passport with the $5.70 Muni Day Pass: only the former includes them. Neither replaces your airport BART fare.",
      "🏝️ Landing on Alcatraz requires the NPS-authorised Alcatraz City Cruises ferry. A sightseeing boat that only sails past does not include a prison visit.",
      "🚗 Golden Gate tolls apply only when driving towards San Francisco, with no cash collection at the bridge. Agree the rental-car payment method before crossing.",
      "California Academy of Sciences: NightLife is for ages 21 and over and requires valid physical photo ID. Planetarium passes are sold separately; choose the daytime programme when visiting with younger guests."
    ],
    "tips_pt": [
      "🚋 Cable car: US$9 por viagem, sem integração; não é a tarifa de um bonde Muni regular.",
      "💳 No BART, use o mesmo cartão bancário ou dispositivo ao entrar e sair, um por passageiro.",
      "✈️ O BART atende o SFO; a tarifa depende do trajeto e é separada dos passes turísticos Muni.",
      "🎫 Muni regular: US$2,85 com Clipper/cartão bancário ou US$3 em dinheiro, com 120 minutos de viagem. Cable cars têm tarifa própria.",
      "🎟️ Para cable cars, compare o Visitor Passport de um dia (US$15) com o Day Pass Muni (US$5,70): só o primeiro os inclui. Nenhum substitui o BART ao aeroporto.",
      "🏝️ Para desembarcar em Alcatraz, é necessário o ferry Alcatraz City Cruises, autorizado pelo NPS. Um passeio de barco que só passa pela ilha não inclui visita à prisão.",
      "🚗 A Golden Gate cobra pedágio só no sentido de San Francisco, sem pagamento em dinheiro na ponte. Combine o pagamento do carro alugado antes de atravessar.",
      "California Academy of Sciences: o NightLife é para pessoas com 21 anos ou mais e exige documento físico válido com foto. Os passes do planetário são vendidos à parte; com menores de 21, escolha a programação diurna."
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
      "✈️ Desde O’Hare, el pasaje regular de tren cuesta US$5. Un pase ilimitado válido evita ese cargo adicional.",
      "🎟️ El pase CTA/Pace de un día vale 24 h desde el primer uso: no vence necesariamente a medianoche.",
      "🚇 Con Ventra o pago bancario, CTA cobra US$2,50 en tren y US$2,25 en bus, con hasta 2 viajes adicionales en 2 h. Desde O’Hare hay tarifa especial.",
      "✈️ O’Hare usa Blue Line, con servicio las 24 h; Midway usa Orange Line, que no funciona toda la noche. No intercambies las rutas al calcular un vuelo temprano.",
      "🫘 Millennium Park, incluido el arte público de Cloud Gate, tiene acceso gratuito. No necesitas comprar una excursión para entrar al parque.",
      "🐠 Las horas gratuitas de Shedd Aquarium para residentes de Illinois no incluyen automáticamente a turistas extranjeros, ni por acompañar a un residente. Revisa la categoría antes de reservar.",
      "🚤 Si buscas el crucero del Chicago Architecture Center, confirma que sea el CAC River Cruise aboard First Lady. No todo paseo en barco del río incluye ese guía ni el mismo recorrido.",
      "Adler Planetarium: la entrada general al museo no equivale a una función bajo la cúpula. Si esa es tu prioridad, añade el show y comprueba su horario antes de organizar el resto del Museum Campus."
    ],
    "tips_en": [
      "✈️ A regular train fare from O’Hare is $5; a valid unlimited-ride pass avoids the extra charge.",
      "🎟️ A CTA/Pace one-day pass lasts 24 hours from first use, rather than necessarily ending at midnight.",
      "🚇 With Ventra or bank-card payment, CTA fares are $2.50 train/$2.25 bus, with up to 2 extra rides in 2 hours. O’Hare departures have a special fare.",
      "✈️ O’Hare uses the 24-hour Blue Line; Midway uses the Orange Line, which is not all-night. Check the correct airport for early flights.",
      "🫘 Millennium Park, including Cloud Gate’s public art, has free admission. A paid guided tour is not required to enter.",
      "🐠 Shedd Aquarium’s Illinois-resident free hours do not automatically include overseas visitors, even when accompanying a resident. Check eligibility before booking.",
      "🚤 For the Chicago Architecture Center cruise, choose CAC River Cruise aboard First Lady. Other river boats do not necessarily include the same guide or route.",
      "Adler Planetarium: general museum admission is not a dome-show ticket. If the show is your priority, add it and check its time before planning the rest of Museum Campus."
    ],
    "tips_pt": [
      "✈️ A tarifa regular de trem saindo de O’Hare é US$5; um passe ilimitado válido evita o adicional.",
      "🎟️ O passe CTA/Pace de um dia vale 24 h desde o primeiro uso, não necessariamente até meia-noite.",
      "🚇 Com Ventra ou cartão bancário, a CTA cobra US$2,50 no trem e US$2,25 no ônibus, com até 2 viagens extras em 2 h. O’Hare tem tarifa especial.",
      "✈️ O’Hare usa a Blue Line, 24 h; Midway usa a Orange Line, que não funciona a noite toda. Confira o aeroporto certo para voos cedo.",
      "🫘 O Millennium Park, incluindo a arte pública Cloud Gate, tem entrada gratuita. Não é preciso comprar excursão para entrar no parque.",
      "🐠 Os horários gratuitos do Shedd Aquarium para residentes de Illinois não incluem automaticamente turistas brasileiros, mesmo acompanhando um residente. Confira a elegibilidade.",
      "🚤 Se quiser o cruzeiro do Chicago Architecture Center, escolha CAC River Cruise aboard First Lady. Outros barcos do rio não incluem necessariamente o mesmo guia ou percurso.",
      "Adler Planetarium: a entrada geral do museu não equivale a um ingresso para sessão na cúpula. Se essa for sua prioridade, acrescente o show e confira o horário antes de organizar o restante do Museum Campus."
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
      "💳 Puedes pagar Metro con tarjeta bancaria sin contacto o celular. En tren, usa el mismo medio para entrar y salir.",
      "✈️ Dulles (IAD) tiene Silver Line; Reagan National (DCA), Blue y Yellow. Revisa el aeropuerto de tu boleto antes de elegir ruta.",
      "🏛️ Los museos Smithsonian de Washington son gratuitos; algunos requieren pase con horario. Reserva desde el sitio del museo.",
      "🕒 El horario general de fin de semana es sábado 6:00–2:00 y domingo 6:00–medianoche; verifica último tren y obras por estación.",
      "🎫 Metrorail regular cuesta US$2,25–6,75 según trayecto y horario; el bus local Metro cuesta US$2,25. Usa la misma tarjeta al entrar y salir del tren.",
      "🏛️ El tour del Capitolio es gratuito y conviene reservarlo en visitthecapitol.gov. No incluye las galerías del Senado o la Cámara: son accesos distintos.",
      "🗼 Para subir al Washington Monument necesitas boleto. La visita no tiene entrada de pago, pero la reserva online cobra una tarifa de gestión; hay boletos del día limitados en el Lodge.",
      "Para ver el transbordador Discovery, elige el Udvar-Hazy Center en Chantilly, Virginia, cerca de Dulles. No es la sede Air and Space del centro de Washington: la entrada es gratuita, pero estacionar tiene costo y el traslado debe planificarse aparte."
    ],
    "tips_en": [
      "💳 Tap a bank card or phone on Metro, as on London’s Tube; on rail, use the same method in and out.",
      "✈️ Dulles (IAD) uses the Silver Line; Reagan National (DCA) uses Blue/Yellow. Check your ticket’s airport.",
      "🏛️ Washington’s Smithsonian museums are free; some require timed-entry passes. Book through the museum’s website.",
      "🕒 Usual weekend rail hours are Saturday 6 am–2 am and Sunday 6 am–midnight; check your station’s last train and works.",
      "🎫 Regular Metrorail fares are $2.25–$6.75 by journey/time; local Metro buses cost $2.25. Use the same card to enter and leave rail stations.",
      "🏛️ Capitol tours are free; book through visitthecapitol.gov. The tour does not include Senate or House galleries, which have separate access.",
      "🗼 Going up the Washington Monument requires a ticket. Admission is free, but online reservations have a handling fee; limited same-day tickets are available at the Lodge.",
      "To see Space Shuttle Discovery, choose the Udvar-Hazy Center in Chantilly, Virginia, near Dulles. It is separate from the downtown Washington Air and Space museum: admission is free, parking costs extra and transport needs its own plan."
    ],
    "tips_pt": [
      "💳 Pague o Metro com cartão bancário por aproximação ou celular, sem recarga de transporte; no trem, use o mesmo meio na entrada e saída.",
      "✈️ Dulles (IAD) tem Silver Line; Reagan National (DCA), Blue e Yellow. Confira o aeroporto da passagem.",
      "🏛️ Os museus Smithsonian de Washington são gratuitos; alguns exigem horário reservado. Reserve no site do museu.",
      "🕒 O horário geral é sábado 6h–2h e domingo 6h–meia-noite; confira o último trem e obras por estação.",
      "🎫 Metrorail regular custa US$2,25–6,75 conforme trajeto/horário; ônibus local Metro custa US$2,25. Use o mesmo cartão para entrar e sair do trem.",
      "🏛️ O tour do Capitólio é gratuito; reserve em visitthecapitol.gov. Ele não inclui as galerias do Senado ou da Câmara, que têm acesso separado.",
      "🗼 Para subir ao Washington Monument é necessário bilhete. A visita é gratuita, mas a reserva online cobra taxa; há bilhetes limitados do dia no Lodge.",
      "Para ver o ônibus espacial Discovery, escolha o Udvar-Hazy Center em Chantilly, Virgínia, perto de Dulles. É outra sede, diferente do Air and Space no centro de Washington: a entrada é gratuita, o estacionamento é pago e o transporte precisa ser planejado à parte."
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
      "💳 Charlie permite pago bancario sin contacto en servicios compatibles de MBTA. Consulta el modo específico: Commuter Rail tiene billetes propios.",
      "🚶 Freedom Trail recorre unos 4 km entre Boston y Charlestown. La línea roja del suelo ayuda a seguirlo.",
      "🚶 Caminar Freedom Trail por tu cuenta es gratuito; algunas visitas interiores y los tours guiados se pagan aparte. La línea roja no representa un boleto que incluya todos los edificios.",
      "⚓ Para subir al USS Constitution, mayores de 18 años deben presentar identificación física válida o pasaporte y pasar seguridad. El barco y el museo cercano se administran por separado.",
      "🧳 Con valijas o cochecito, usa el planificador accesible de MBTA y sus alertas de ascensores. No elijas una conexión solo por ser la más corta en el mapa.",
      "Museum of Science de Boston: el Omni Theater y el Planetarium requieren tickets con horario propio. Si quieres una función concreta, resérvala y organiza las salas alrededor de ese bloque; revisa por separado qué entrada necesitas para Exhibit Halls."
    ],
    "tips_en": [
      "✈️ Silver Line SL1 is free from Logan terminals to South Station; do not assume the return to the airport is also free.",
      "🔵 The Blue Line serves Airport station; a free Massport shuttle links the station with the terminals.",
      "💳 Charlie supports bank-card tapping on eligible MBTA services. Check the mode: Commuter Rail uses its own tickets.",
      "🚶 The Freedom Trail runs about 2.5 miles/4 km through Boston and Charlestown, marked by a red line.",
      "🚶 Walking the Freedom Trail independently is free; some interiors and guided tours cost extra. The red trail is not an admission pass to every building.",
      "⚓ To board USS Constitution, adults 18+ need valid physical photo ID or a passport and must clear security. The ship and nearby museum are operated separately.",
      "🧳 With luggage or a pushchair, use MBTA’s accessible trip planner and lift alerts, rather than choosing a connection only because it is shortest on the map.",
      "Boston’s Museum of Science: Omni Theater and Planetarium shows require their own timed tickets. Book the specific show you want and arrange your exhibitions around that block; check Exhibit Halls admission separately."
    ],
    "tips_pt": [
      "✈️ A Silver Line SL1 é gratuita dos terminais de Logan até South Station; não presuma que a volta ao aeroporto também seja grátis.",
      "🔵 A Blue Line atende a estação Airport; um shuttle gratuito da Massport liga a estação aos terminais.",
      "💳 O Charlie aceita cartão bancário por aproximação nos serviços compatíveis da MBTA. Confira a modalidade: Commuter Rail usa bilhetes próprios.",
      "🚶 A Freedom Trail tem cerca de 4 km entre Boston e Charlestown, marcada por uma linha vermelha.",
      "🚶 Percorrer a Freedom Trail por conta própria é gratuito; alguns interiores e tours guiados são pagos. A linha vermelha não é um ingresso para todos os prédios.",
      "⚓ Para embarcar no USS Constitution, maiores de 18 anos precisam de documento físico válido ou passaporte e inspeção de segurança. O navio e o museu próximo têm gestão separada.",
      "🧳 Com malas ou carrinho, use o planejador acessível da MBTA e os alertas de elevadores, em vez de escolher a conexão só pela distância no mapa.",
      "Museum of Science de Boston: Omni Theater e Planetarium exigem ingressos próprios com horário. Reserve a sessão desejada e organize as exposições ao redor desse intervalo; confira separadamente a entrada para Exhibit Halls."
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
      "📱 Con ORCA, valida al subir a Link. El operador indica que ya no es necesario validar al bajar de Link o bus.",
      "✈️ Para llegar a la estación SeaTac/Airport desde la terminal, sigue el recorrido peatonal por el estacionamiento; añade ese tiempo al trayecto.",
      "🎟️ El pase regional ORCA de US$6 cubre viajes participantes de hasta US$3; servicios más caros pueden requerir saldo adicional.",
      "⛴️ En Seattle–Bainbridge Island, el pasaje de peatón se cobra al salir de Seattle; el regreso a pie desde Bainbridge no tiene otro cobro de pasajero. Los vehículos tienen reglas diferentes.",
      "🐟 Entrar a Pike Place Market es gratuito. Los tours gastronómicos son opcionales y se pagan por separado; no necesitas uno para recorrer el mercado.",
      "Boeing Everett Factory Tour: reserva con anticipación y comprueba la altura mínima de 122 cm. No se permiten celulares, cámaras ni bolsos durante el recorrido; hay lockers gratuitos y recomiendan llegar 30 minutos antes.",
      "The Museum of Flight ofrece entrada gratuita de 17:00 a 21:00 el primer jueves del mes. Si tu viaje coincide, comprueba la fecha en su calendario antes de pagar una visita diurna; es una actividad distinta del tour de la fábrica Boeing en Everett."
    ],
    "tips_en": [
      "🚆 Link 1/2 Line regular adult fare is $3 per trip, regardless of distance.",
      "📱 With ORCA, tap before boarding Link; the operator says you no longer need to tap off Link or buses.",
      "✈️ Follow the walkway through the airport garage to SeaTac/Airport station; add that walk to your journey time.",
      "🎟️ The $6 regional ORCA day pass covers eligible rides up to $3; higher fares may need extra stored value.",
      "⛴️ On Seattle–Bainbridge Island, walk-on passenger fares are collected in Seattle; the walk-on return from Bainbridge has no further passenger charge. Vehicles follow different rules.",
      "🐟 Pike Place Market has free admission. Food tours are optional paid experiences; you do not need one to explore the market.",
      "Boeing Everett Factory Tour: book ahead and check the 122 cm/48 in minimum height. Phones, cameras and bags are not allowed on the tour; free lockers are provided and arrival 30 minutes early is recommended.",
      "The Museum of Flight offers free admission from 5–9 pm on the first Thursday of the month. If your trip overlaps, check its calendar before buying a daytime visit; it is a different activity from the Boeing factory tour in Everett."
    ],
    "tips_pt": [
      "🚆 Link linhas 1 e 2: tarifa regular de adulto US$3 por viagem, sem depender da distância.",
      "📱 Com ORCA, valide antes de embarcar no Link; a operadora informa que não é mais necessário validar ao sair do Link ou ônibus.",
      "✈️ Siga a passagem pelo estacionamento até a estação SeaTac/Airport; inclua essa caminhada no tempo de trajeto.",
      "🎟️ O passe regional ORCA de US$6 cobre viagens participantes de até US$3; serviços mais caros podem exigir saldo extra.",
      "⛴️ Em Seattle–Bainbridge Island, o passageiro a pé paga saindo de Seattle; a volta a pé de Bainbridge não cobra outra passagem. Veículos têm regras diferentes.",
      "🐟 A entrada no Pike Place Market é gratuita. Tours gastronômicos são opcionais e pagos à parte; não são necessários para conhecer o mercado.",
      "Boeing Everett Factory Tour: reserve com antecedência e confira a altura mínima de 122 cm. Celulares, câmeras e bolsas não são permitidos no passeio; há armários gratuitos e a recomendação é chegar 30 minutos antes.",
      "The Museum of Flight oferece entrada gratuita das 17h às 21h na primeira quinta-feira do mês. Se coincidir com a viagem, confira o calendário antes de pagar uma visita diurna; é uma atividade diferente do tour da fábrica Boeing em Everett."
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
      "📱 Le Pass permite comprar y validar viajes de bus, streetcar y ferry. Ten el pase activo y disponible antes de subir; no confundas comprarlo con haberlo validado.",
      "🚋 Para explorar St. Charles Avenue y el área del Garden District, revisa la ruta St. Charles y sus avisos de servicio.",
      "🌳 Las rutas Canal/Cemeteries y Canal/City Park tienen destinos distintos; revisa el cartel antes de subir.",
      "✈️ Desde MSY, RTA opera el Airport Express 202. No confundas su boleto o pase con los de JET: para combinar ambas redes, el aeropuerto indica que se necesita Regional Ride u otro pago separado.",
      "☕ Si vas al Café du Monde original del French Market, lleva efectivo: su carta oficial indica “Cash Only”. No supongas que podrás pagar los beignets con tarjeta.",
      "Audubon: Aquarium e Insectarium se ofrecen juntos en una entrada; el Zoo tiene su propio ticket y existe un combo para los tres. Compara esos productos según lo que realmente vas a visitar y revisa la vigencia del combo antes de repartir las visitas entre días."
    ],
    "tips_en": [
      "🎫 RTA regular bus/streetcar fare is $1.25; a one-day pass costs $3.",
      "📱 Le Pass sells and validates bus, streetcar and ferry fares. Have the active pass ready before boarding; buying is not the same as validating.",
      "🚋 For St. Charles Avenue and the Garden District area, check the St. Charles route and its service alerts.",
      "🌳 Canal/Cemeteries and Canal/City Park have different destinations; check the sign before boarding.",
      "✈️ RTA runs Airport Express 202 from MSY. Do not assume its ticket/pass covers JET: the airport specifies Regional Ride for both networks, or separate fares.",
      "☕ Bring cash to the original French Market Café du Monde: its official menu says “Cash Only”. Do not rely on a card for your beignets.",
      "Audubon: Aquarium and Insectarium are offered together on one ticket; the Zoo has its own ticket and a three-attraction combo is available. Compare products for the places you will actually visit and check combo validity before splitting visits across days."
    ],
    "tips_pt": [
      "🎫 RTA: ônibus ou streetcar regular US$1,25; passe de um dia US$3.",
      "📱 O Le Pass permite comprar e validar viagens de ônibus, streetcar e ferry. Tenha o passe ativo pronto ao embarcar; comprar não é o mesmo que validar.",
      "🚋 Para St. Charles Avenue e a região do Garden District, confira a rota St. Charles e os avisos de serviço.",
      "🌳 Canal/Cemeteries e Canal/City Park têm destinos diferentes; confira a placa antes de embarcar.",
      "✈️ A RTA opera o Airport Express 202 saindo do MSY. Não presuma integração com JET: o aeroporto indica Regional Ride para ambas as redes ou pagamentos separados.",
      "☕ Leve dinheiro ao Café du Monde original do French Market: o cardápio oficial informa “Cash Only”. Não conte com cartão para os beignets.",
      "Audubon: Aquarium e Insectarium são oferecidos juntos em um ingresso; o Zoo tem ingresso próprio e há combo para os três. Compare os produtos conforme o que realmente pretende visitar e confira a validade do combo antes de dividir as visitas entre dias."
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
      "🎵 Red Rocks permite visitas por cuenta propia sin pagar entrada ni estacionamiento cuando no hay evento. En días de concierto el anfiteatro puede cerrar temprano: confirma el acceso de ese día, no la hora del show.",
      "🏔️ Para una excursión a Rocky Mountain National Park, comprueba si tu fecha y sector requieren Timed Entry y si incluye Bear Lake Road. El permiso de horario y la entrada al parque son requisitos distintos.",
      "Denver Museum of Nature & Science: en sus Free Days y Free Nights no hace falta ticket para la entrada general. El Gates Planetarium, el Sturm Infinity Theater y las exposiciones temporales requieren entradas aparte; un día gratuito no incluye automáticamente esas experiencias."
    ],
    "tips_en": [
      "🎫 Standard RTD fares: $2.75 for 3 hours or $5.50 for a day; airport travel needs the appropriate fare.",
      "✈️ The standard $10 Airport Day Pass covers the RTD system for the service day, including the airport.",
      "🚆 The A Line links DEN and Union Station in about 37 minutes; add time to reach the platform.",
      "🚌 The 16th Street FreeRide shuttle is free; check its stops and current detours.",
      "🎵 Red Rocks allows free self-guided visits and parking on non-event days. On concert days the amphitheatre can close early; check daytime access, not just showtime.",
      "🏔️ For Rocky Mountain National Park, check whether your date/area needs Timed Entry and whether it includes Bear Lake Road. A time reservation and park admission are separate requirements.",
      "Denver Museum of Nature & Science: Free Days and Free Nights require no general admission ticket. Gates Planetarium, Sturm Infinity Theater and temporary exhibitions need separate tickets; a free day does not automatically include those experiences."
    ],
    "tips_pt": [
      "🎫 RTD regular: US$2,75 por 3 h ou US$5,50 por dia; aeroporto exige a tarifa correspondente.",
      "✈️ O Airport Day Pass regular custa US$10 e inclui o sistema RTD no dia de serviço, inclusive aeroporto.",
      "🚆 A A Line liga DEN a Union Station em cerca de 37 minutos; acrescente o tempo até a plataforma.",
      "🚌 O shuttle FreeRide da 16th Street é gratuito; confira os pontos e desvios do dia.",
      "🎵 O Red Rocks permite visita por conta própria e estacionamento gratuitos em dias sem evento. Em dias de show, o anfiteatro pode fechar cedo; confira o acesso diurno, não só o horário do espetáculo.",
      "🏔️ Para Rocky Mountain National Park, confira se a data/área exige Timed Entry e se inclui Bear Lake Road. A reserva de horário e a entrada do parque são requisitos separados.",
      "Denver Museum of Nature & Science: nos Free Days e Free Nights não é preciso ingresso para a entrada geral. Gates Planetarium, Sturm Infinity Theater e exposições temporárias exigem ingressos separados; o dia gratuito não inclui automaticamente essas experiências."
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

// Render editorial tips with the same outline icons as the rest of the app.
window.renderCityTip = function(text) {
  const match = text.match(/^\s*(\p{Regional_Indicator}{2}|\p{Extended_Pictographic}[️‍\u{1F3FB}-\u{1F3FF}]*)\s*/u);
  const clean = match ? text.slice(match[0].length) : text;
  const escaped = clean.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const icon = window.uiTipIcon?.(match ? match[1] : /Disney|Universal|Hogwarts|SeaWorld|LEGOLAND|Knott/.test(clean) ? "ferris" : /Kennedy|Intrepid|Udvar.Hazy|Boeing|Museum of Flight|Discovery/.test(clean) ? "plane" : /Sphere|Omni Theater/.test(clean) ? "film" : "bulb", 16) || "";
  return icon + " " + escaped;
};
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
  panel.innerHTML = `\n        <div style="border-top:1px solid var(--border);padding-top:14px;margin-top:4px;">\n            <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">\n                <div>\n                    <div style="font-size:1rem;font-weight:900;color:var(--text);">${esc(city.name)}</div>\n                    <div style="font-size:.7rem;font-weight:600;color:var(--text-dim);">${cityState}</div>\n                </div>\n            </div>\n            <div style="display:flex;flex-direction:column;gap:10px;">\n                <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;">\n                    <div style="font-size:.6rem;font-weight:800;color:var(--text-dim);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px;">${sysLabel}</div>\n                    <div style="font-size:.82rem;font-weight:700;color:var(--text);">${citySystem}</div>\n                </div>\n                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">\n                    <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:12px;">\n                        <div style="font-size:.6rem;font-weight:800;color:var(--text-dim);text-transform:uppercase;letter-spacing:.8px;margin-bottom:5px;">${priceLabel}</div>\n                        <div style="font-size:.75rem;font-weight:700;color:var(--text);line-height:1.4;">${cityPrice}</div>\n                    </div>\n                    <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:12px;">\n                        <div style="font-size:.6rem;font-weight:800;color:var(--text-dim);text-transform:uppercase;letter-spacing:.8px;margin-bottom:5px;">${payLabel}</div>\n                        <div style="font-size:.75rem;font-weight:700;color:var(--text);line-height:1.4;">${cityPayment}</div>\n                    </div>\n                </div>\n                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">\n                    <a href="${city.map}" target="_blank" style="background:var(--primary);color:white;border-radius:12px;padding:12px;text-decoration:none;display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;">\n                        <span style="font-size:1.2rem;">🗺️</span>\n                        <span style="font-size:.7rem;font-weight:800;">${cityMapLabel}</span>\n                        <span style="font-size:.6rem;opacity:.85;">${officialLabel}</span>\n                    </a>\n                    <a href="${city.gmaps}" target="_blank" style="background:var(--accent);color:white;border-radius:12px;padding:12px;text-decoration:none;display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;">\n                        <span style="font-size:1.2rem;">📍</span>\n                        <span style="font-size:.7rem;font-weight:800;">Google Maps</span>\n                        <span style="font-size:.6rem;opacity:.85;">${realtimeLabel}</span>\n                    </a>\n                </div>\n                <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;">\n                    <div style="font-size:.6rem;font-weight:800;color:var(--text-dim);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px;">${appLabel}</div>\n                    <a href="${city.appLink}" target="_blank" style="font-size:.8rem;font-weight:700;color:var(--primary);text-decoration:none;">${city.app}</a>\n                </div>\n                <div style="background:rgba(16,185,129,.08);border:1.5px solid var(--success);border-radius:12px;padding:12px 14px;">\n                    <div style="font-size:.6rem;font-weight:800;color:var(--success);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px;">${tipsLabel}</div>\n                    <div style="display:flex;flex-direction:column;gap:6px;">\n                        ${tips.map(tip => `<div style="font-size:.75rem;font-weight:600;color:var(--text);line-height:1.4;">${window.renderCityTip ? window.renderCityTip(tip) : tip}</div>`).join("")}\n                    </div>\n                </div>\n            </div>\n        </div>\n    `;
  panel.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
};

document.addEventListener("DOMContentLoaded", renderCityGrid);
