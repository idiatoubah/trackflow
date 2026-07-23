const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const remotePackages = [
  {
    "id": "836ea1ac-0b4e-43bd-8bb3-491993dc930a",
    "trackingNumber": "BV-0018",
    "clientEmail": "id677010@gmail.com",
    "clientName": "FATIMA",
    "clientPhone": "+17189080440",
    "destination": "USA",
    "carrier": "BOULLI-GP",
    "weight": 53,
    "createdAt": "2026-06-19T16:14:56.366Z",
    "updatedAt": "2026-06-19T16:14:56.366Z",
    "events": [
      {
        "id": "ed32a3e1-70d6-40cc-a818-a0f6906023be",
        "status": "DELIVERED",
        "location": null,
        "notes": null,
        "timestamp": "2026-06-27T18:33:06.638Z"
      }
    ]
  },
  {
    "id": "c57239fa-94b6-4029-b11a-317596ead710",
    "trackingNumber": "BV-0016",
    "clientEmail": "torombawann@gmail.com",
    "clientName": "IBRAHIMA BOIRO BAH",
    "clientPhone": "+33605721418",
    "destination": "PARIS",
    "carrier": "BOULLI-GP",
    "weight": 5.6,
    "createdAt": "2026-05-20T13:13:21.618Z",
    "updatedAt": "2026-05-20T13:13:21.618Z",
    "events": [
      {
        "id": "9f9cbfaa-31a4-4d62-a8fc-7140dedf8dce",
        "status": "DELIVERED",
        "location": null,
        "notes": null,
        "timestamp": "2026-05-24T22:56:36.830Z"
      }
    ]
  },
  {
    "id": "168fe0ea-7ca0-41cb-aa47-41174e7f4014",
    "trackingNumber": "BV-0015",
    "clientEmail": "hsow26711@gmail.com",
    "clientName": "HASSANATOU SOW",
    "clientPhone": "+16783307948",
    "destination": "USA",
    "carrier": "BOULLI-GP",
    "weight": 3,
    "createdAt": "2026-05-16T12:46:10.923Z",
    "updatedAt": "2026-05-16T12:46:10.923Z",
    "events": [
      {
        "id": "a3e6b635-2bff-48c4-ad4b-232e6a6d0d36",
        "status": "DELIVERED",
        "location": null,
        "notes": null,
        "timestamp": "2026-05-27T21:10:03.148Z"
      }
    ]
  },
  {
    "id": "1dd61445-4b57-47df-93af-ff612313103c",
    "trackingNumber": "BV-0014",
    "clientEmail": "Oumarcrbah@gmail.com",
    "clientName": "OUMAR BAH",
    "clientPhone": "+19298661865",
    "destination": "USA",
    "carrier": "BOULLI-GP",
    "weight": 1.2,
    "createdAt": "2026-05-16T12:34:48.916Z",
    "updatedAt": "2026-05-16T12:34:48.916Z",
    "events": [
      {
        "id": "74381ded-31d9-41b1-8c0f-e14c9576ef25",
        "status": "DELIVERED",
        "location": null,
        "notes": null,
        "timestamp": "2026-05-27T21:10:08.711Z"
      }
    ]
  },
  {
    "id": "2ad5071c-8257-4ab7-aeff-2d8b21259508",
    "trackingNumber": "BV-0013",
    "clientEmail": "Ousmanbarry9090@gmail.com",
    "clientName": "IBRAHIMA BARRY",
    "clientPhone": "+19172048706",
    "destination": "USA",
    "carrier": "BOULLI-GP",
    "weight": 18.8,
    "createdAt": "2026-05-16T12:16:51.629Z",
    "updatedAt": "2026-05-16T12:16:51.629Z",
    "events": [
      {
        "id": "71b0a886-df3d-4362-a0cb-b7054e8fb52a",
        "status": "DELIVERED",
        "location": null,
        "notes": null,
        "timestamp": "2026-05-24T22:56:04.809Z"
      }
    ]
  },
  {
    "id": "44d58016-1a5b-463a-a038-8529a521e716",
    "trackingNumber": "BV-0012",
    "clientEmail": "Hadjaby.fab@gmail.com",
    "clientName": "AISSATOU",
    "clientPhone": "+19178186679",
    "destination": "USA",
    "carrier": "BOULLI-GP",
    "weight": 6,
    "createdAt": "2026-05-16T12:00:07.023Z",
    "updatedAt": "2026-05-16T12:00:07.023Z",
    "events": [
      {
        "id": "8e5c9d27-8099-4dc8-97e7-e4517dcd6769",
        "status": "DELIVERED",
        "location": null,
        "notes": null,
        "timestamp": "2026-05-27T21:10:17.264Z"
      }
    ]
  },
  {
    "id": "3053f2c6-a766-4b1e-8057-fb554320e99a",
    "trackingNumber": "BV-0011",
    "clientEmail": "Hadjaby.fab@gmail.com",
    "clientName": "LAILA BAH",
    "clientPhone": "+12402809179",
    "destination": "USA",
    "carrier": "BOULLI-GP",
    "weight": 5.6,
    "createdAt": "2026-05-16T11:59:00.883Z",
    "updatedAt": "2026-05-16T11:59:00.883Z",
    "events": [
      {
        "id": "5a9245cd-1d6c-420e-b3b5-95a657df92ff",
        "status": "DELIVERED",
        "location": null,
        "notes": null,
        "timestamp": "2026-05-27T21:10:20.826Z"
      }
    ]
  },
  {
    "id": "48c87b58-af28-46b3-bdbe-b23d643a2f94",
    "trackingNumber": "BV-0010",
    "clientEmail": "fatimabahbarry009@gmail.com",
    "clientName": "ABDOUL AZIZ BAH",
    "clientPhone": "+19146045563",
    "destination": "USA",
    "carrier": "BOULLI-GP",
    "weight": null,
    "createdAt": "2026-05-14T14:05:58.208Z",
    "updatedAt": "2026-05-14T14:05:58.208Z",
    "events": [
      {
        "id": "e1507de2-d776-4052-b795-319fc6f65130",
        "status": "DELIVERED",
        "location": null,
        "notes": null,
        "timestamp": "2026-05-25T22:16:41.021Z"
      }
    ]
  },
  {
    "id": "688ff402-a0db-41aa-a2af-265a56b1ff66",
    "trackingNumber": "BV-0009",
    "clientEmail": "Oumouj246@gmail.com",
    "clientName": "RUGUIATU JALLAH",
    "clientPhone": "+16108480933",
    "destination": "USA",
    "carrier": "BOULLI-GP",
    "weight": null,
    "createdAt": "2026-05-14T12:57:31.188Z",
    "updatedAt": "2026-05-14T12:57:31.188Z",
    "events": [
      {
        "id": "45ce3530-2448-4fe4-b4da-2aeebc8e0bb6",
        "status": "DELIVERED",
        "location": null,
        "notes": null,
        "timestamp": "2026-05-27T21:10:29.595Z"
      }
    ]
  },
  {
    "id": "c10c22d4-dbf1-401d-a60c-263209c3c9f7",
    "trackingNumber": "BV-0008",
    "clientEmail": "Thiernobadrou@gmail.com",
    "clientName": "THIERNO BAH",
    "clientPhone": "+13852429035",
    "destination": "USA",
    "carrier": "BOULLI-GP",
    "weight": null,
    "createdAt": "2026-05-14T12:45:44.669Z",
    "updatedAt": "2026-05-14T12:45:44.669Z",
    "events": [
      {
        "id": "31c42276-145d-4481-b633-22f712140495",
        "status": "DELIVERED",
        "location": null,
        "notes": null,
        "timestamp": "2026-05-27T21:10:33.274Z"
      }
    ]
  },
  {
    "id": "4a73676e-d622-4ead-b1d8-e8541fc88771",
    "trackingNumber": "BV-0007",
    "clientEmail": "fatimaaliou2012@gmail.com",
    "clientName": "LAYATOULAYE DIALLO",
    "clientPhone": "+13476574291",
    "destination": "USA",
    "carrier": "BOULLI-GP",
    "weight": null,
    "createdAt": "2026-05-13T18:19:03.850Z",
    "updatedAt": "2026-05-13T18:19:03.850Z",
    "events": [
      {
        "id": "2adba9bd-b9cc-49ba-a2c6-2be1c504d500",
        "status": "DELIVERED",
        "location": null,
        "notes": null,
        "timestamp": "2026-05-27T21:10:36.661Z"
      }
    ]
  },
  {
    "id": "16c8daf8-6f60-4a3c-90e4-d8f4adeeb84d",
    "trackingNumber": "BV-0006",
    "clientEmail": "Alphayayabarry451@gmail.com",
    "clientName": "ALPHA YAYA BARRY",
    "clientPhone": "+12672533843",
    "destination": "USA",
    "carrier": "BOULLI-GP",
    "weight": null,
    "createdAt": "2026-05-13T17:13:40.766Z",
    "updatedAt": "2026-05-13T17:13:40.766Z",
    "events": [
      {
        "id": "802d8e4e-504b-4eb1-8ddd-fc082983dcc2",
        "status": "DELIVERED",
        "location": null,
        "notes": null,
        "timestamp": "2026-05-27T21:10:40.176Z"
      }
    ]
  },
  {
    "id": "f292495b-1047-40fe-b6c4-0f72941d0f70",
    "trackingNumber": "BV-0005",
    "clientEmail": "thiernomamadou493@gmail.com",
    "clientName": "THIERNO MAMADOU DIALLO",
    "clientPhone": "+33605984586",
    "destination": "PARIS",
    "carrier": "BOULLI-GP",
    "weight": null,
    "createdAt": "2026-05-13T13:45:40.165Z",
    "updatedAt": "2026-05-13T13:45:40.165Z",
    "events": [
      {
        "id": "15384f4a-425e-4873-9fbc-e9b2a61b5a1b",
        "status": "DELIVERED",
        "location": null,
        "notes": null,
        "timestamp": "2026-05-14T12:42:30.751Z"
      }
    ]
  },
  {
    "id": "547b37e4-9c47-403e-9f50-2b2918ea7bd9",
    "trackingNumber": "BV-0004",
    "clientEmail": "diallorayhi25@yahoo.com",
    "clientName": "RAYHANATOU DIALLO",
    "clientPhone": "+19175472571",
    "destination": "USA",
    "carrier": "BOULLI-GP",
    "weight": null,
    "createdAt": "2026-05-12T16:40:01.897Z",
    "updatedAt": "2026-05-12T16:40:01.897Z",
    "events": [
      {
        "id": "2d4adb08-f40a-4299-9cee-95ef9c1dfe08",
        "status": "DELIVERED",
        "location": null,
        "notes": null,
        "timestamp": "2026-05-27T21:10:43.642Z"
      }
    ]
  },
  {
    "id": "b073a2f6-ba50-4997-84b4-8993bd018e96",
    "trackingNumber": "BV-0003",
    "clientEmail": "bahk19651@gmail.com",
    "clientName": "KADIATOU BAH",
    "clientPhone": "+16315523794",
    "destination": "USA",
    "carrier": "BOULLI-GP",
    "weight": null,
    "createdAt": "2026-05-12T16:01:02.003Z",
    "updatedAt": "2026-05-12T16:01:02.003Z",
    "events": [
      {
        "id": "a187f03c-a885-4689-b4a8-a4b4fb563e40",
        "status": "SHIPPED",
        "location": null,
        "notes": null,
        "timestamp": "2026-06-18T12:43:06.868Z"
      }
    ]
  },
  {
    "id": "36b97c77-b7c9-4c08-842b-810cb8f637d6",
    "trackingNumber": "BV-0002",
    "clientEmail": "Thiernodiallodioly@gmail.com",
    "clientName": "THIERNO SADOU",
    "clientPhone": "+16466275233",
    "destination": "USA",
    "carrier": "BOULLI-GP",
    "weight": null,
    "createdAt": "2026-05-12T15:59:06.110Z",
    "updatedAt": "2026-05-12T15:59:06.110Z",
    "events": [
      {
        "id": "1b4699d1-149a-4459-bf47-10ddd814b385",
        "status": "DELIVERED",
        "location": null,
        "notes": null,
        "timestamp": "2026-05-25T22:17:14.623Z"
      }
    ]
  },
  {
    "id": "101bb7b0-8f84-4f14-91b5-2285ede2a042",
    "trackingNumber": "BV-0001",
    "clientEmail": "Safiatoumowoury@gmail.com",
    "clientName": "SAFIATOU",
    "clientPhone": "+16462605021",
    "destination": "USA",
    "carrier": null,
    "weight": null,
    "createdAt": "2026-05-12T12:40:38.485Z",
    "updatedAt": "2026-05-12T12:40:38.485Z",
    "events": [
      {
        "id": "f3fe217b-cec9-4e50-a521-5ac844cf0fdf",
        "status": "DELIVERED",
        "location": null,
        "notes": null,
        "timestamp": "2026-05-27T21:10:51.209Z"
      }
    ]
  }
];

async function sync() {
  console.log(`Début de l'importation de ${remotePackages.length} colis depuis Vercel...`);

  let count = 0;
  for (const pkg of remotePackages) {
    const existing = await prisma.package.findUnique({
      where: { trackingNumber: pkg.trackingNumber },
    });

    if (!existing) {
      const created = await prisma.package.create({
        data: {
          id: pkg.id,
          trackingNumber: pkg.trackingNumber,
          clientEmail: pkg.clientEmail,
          clientName: pkg.clientName,
          clientPhone: pkg.clientPhone,
          destination: pkg.destination,
          carrier: pkg.carrier,
          weight: pkg.weight,
          departureDate: new Date(pkg.createdAt),
          createdAt: new Date(pkg.createdAt),
          updatedAt: new Date(pkg.updatedAt),
        },
      });

      if (pkg.events && pkg.events.length > 0) {
        for (const evt of pkg.events) {
          await prisma.trackingEvent.create({
            data: {
              id: evt.id,
              packageId: created.id,
              status: evt.status,
              location: evt.location,
              notes: evt.notes,
              timestamp: new Date(evt.timestamp),
            },
          });
        }
      }
      count++;
      console.log(`+ Colis ${pkg.trackingNumber} (${pkg.clientName}) importé.`);
    } else {
      console.log(`- Colis ${pkg.trackingNumber} existe déjà, ignoré.`);
    }
  }

  console.log(`\n🎉 Synchro terminée : ${count} colis réels importés dans votre application local !`);
}

sync()
  .catch((err) => {
    console.error('Erreur lors de la synchronisation:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
