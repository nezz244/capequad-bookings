export interface BookingActivity {
    id: string;
    slug: string;
    title: string;
    shortDescription: string;
    fullDescription: string;
    price: number;
    priceUnit?: string;
    maxPeoplePerSlot: number;
    timeStart: string;
    timeEnd: string;
    dates: string[];
    imgUrl: string;
    hideCardTitle?: boolean;
    gallery: string[];
    exclusionNote?: string;
    addons: unknown[];
    merchantProductType: string;
}

export const BOOKING_ACTIVITIES: BookingActivity[] = [
    {
        id: 'ca-quadbiking-1hr-grabouw',
        slug: 'quadbiking-1hr-grabouw',
        title: 'Quadbiking 1hr',
        shortDescription:
            'Experience the thrill of adventure in the Grabouw mountains on a guided quad biking tour, with a scenic waterfall stop along the way. Ride along scenic trails and enjoy panoramic views of the surrounding landscapes.',
        fullDescription: `
<div class="space-y-3 text-sm text-gray-700 leading-snug">
  <p>
    Guided <strong>quad biking</strong> from <strong>Trails End Hotel</strong> in the Grabouw mountains - winding trails, rugged terrain, a scenic <strong>waterfall stop</strong>, and wide-open views with an experienced guide. Great for thrill-seekers and sightseers alike. Add lunch &amp; transport when you book (per person).
  </p>

  <div>
    <h4 class="font-bold text-base mb-1">Highlights</h4>
    <ul class="list-disc ml-5 space-y-0.5">
      <li>Scenic mountain trails &amp; viewpoints</li>
      <li>Scenic waterfall stop along the trail</li>
      <li>Quad bike on rugged paths</li>
      <li>Panoramic valley &amp; mountain views</li>
    </ul>
  </div>

  <div>
    <h4 class="font-bold text-base mb-1">Inclusions &amp; exclusions</h4>
    <p class="mb-0.5"><span class="font-semibold">Includes:</span> guided quad tour with waterfall stop, safety equipment, guide.</p>
    <p class="mb-0"><span class="font-semibold">Not included:</span> R100 nature reserve entrance permit.</p>
  </div>
</div>
`,
        price: 599,
        maxPeoplePerSlot: 7,
        timeStart: '10:00 AM',
        timeEnd: '17:00 PM',
        dates: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
        imgUrl: 'assets/images/activities/quadbike-waterfall-cover-landscape.jpg',
        hideCardTitle: true,
        gallery: [
            'assets/images/activities/quadbike-waterfall-cover-landscape.jpg',
            'assets/images/activities/quad2.png',
            'assets/images/activities/quads1.jpeg',
            'assets/images/activities/quads3.jpeg'
        ],
        exclusionNote: 'Excludes R100 nature reserve entrance permit, paid on arrival.',
        addons: [],
        merchantProductType: 'Adventure tours > Quad biking > Grabouw'
    },
    {
        id: 'ca-couple-buggy-waterfall-grabouw',
        slug: 'couple-buggy-waterfall-grabouw',
        title: 'Capetown couple forest adventure plus waterfall stop',
        shortDescription:
            'Drive, explore, and stop at the waterfall on a couple buggy experience through scenic forest trails. Perfect for photos and a memorable Cape Town adventure, with guided routes, rugged terrain, and wide-open mountain views along the way.',
        fullDescription: `
<div class="space-y-3 text-sm text-gray-700 leading-snug">
  <p>
    Guided <strong>couple buggy</strong> forest adventure from <strong>Trails End Hotel</strong> in the Grabouw mountains - scenic trails, rugged terrain, a beautiful <strong>waterfall stop</strong>, and photo-friendly views with an experienced guide.
  </p>

  <div>
    <h4 class="font-bold text-base mb-1">Highlights</h4>
    <ul class="list-disc ml-5 space-y-0.5">
      <li>Scenic mountain trails &amp; viewpoints</li>
      <li>Scenic waterfall stop along the trail</li>
      <li>Couple buggy experience through forest trails</li>
      <li>Perfect setting for memorable photos</li>
    </ul>
  </div>

  <div>
    <h4 class="font-bold text-base mb-1">Inclusions &amp; exclusions</h4>
    <p class="mb-0.5"><span class="font-semibold">Includes:</span> guided couple buggy forest adventure with waterfall stop, safety equipment, guide.</p>
    <p class="mb-0"><span class="font-semibold">Not included:</span> R100 nature reserve entrance permit.</p>
  </div>
</div>
`,
        price: 1500,
        priceUnit: 'couple',
        maxPeoplePerSlot: 1,
        timeStart: '10:00 AM',
        timeEnd: '17:00 PM',
        dates: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
        imgUrl: 'assets/images/activities/waterfall-buggy-cover-landscape.jpg',
        hideCardTitle: true,
        gallery: [
            'assets/images/activities/waterfall-buggy-cover-landscape.jpg',
            'assets/images/activities/waterfall-buggy-gallery-01.jpeg',
            'assets/images/activities/waterfall-buggy-gallery-02.jpeg',
            'assets/images/activities/buggy1.jpeg',
            'assets/images/activities/buggy2.jpeg',
            'assets/images/activities/buggy3.jpeg',
            'assets/images/activities/buggy4.jpeg',
            'assets/images/activities/buggy5.png',
            'assets/images/activities/buggy7.png'
        ],
        exclusionNote: 'Excludes R100 nature reserve entrance permit, paid on arrival.',
        addons: [],
        merchantProductType: 'Adventure tours > Dune buggy > Grabouw'
    },
    {
        id: 'ca-atlantis-dune-quad-1hr',
        slug: 'atlantis-dune-quad-biking-1hr',
        title: 'Atlantis dune quad biking 1hr',
        shortDescription:
            'Experience the thrill of off-road adventure as you embark on an exhilarating quadbike tour at Atlantis Dunes, Cape Town. Get ready to rev your engine and create unforgettable memories.',
        fullDescription: `
<div class="space-y-3 text-sm text-gray-700 leading-snug">
  <p>
    Get ready for an adrenaline-pumping adventure as you embark on a thrilling <strong>quadbike experience</strong> at <strong>Atlantis Dunes, Cape Town</strong>. This action-packed activity offers a unique opportunity to explore the stunning natural landscapes of the dunes while enjoying the exhilaration of off-road quadbiking.
  </p>

  <p>
    Your adventure begins with a safety briefing and equipment fitting by our experienced guides, who will ensure that you are comfortable and ready for the ride. Then, hop on your quadbike and rev your engine as you embark on an exciting journey through the picturesque Atlantis Dunes.
  </p>

  <div>
    <h4 class="font-bold text-base mb-1">Highlights</h4>
    <ul class="list-disc ml-5 space-y-0.5">
      <li>Guided quadbike tour at Atlantis Dunes</li>
      <li>Safety briefing and equipment fitting</li>
      <li>Off-road dune riding through natural landscapes</li>
      <li>Adrenaline-filled Cape Town adventure</li>
    </ul>
  </div>

  <div>
    <h4 class="font-bold text-base mb-1">Inclusions &amp; exclusions</h4>
    <p class="mb-0.5"><span class="font-semibold">Includes:</span> guided quadbike tour, safety briefing, equipment fitting, guide.</p>
    <p class="mb-0"><span class="font-semibold">Not included:</span> R250 nature reserve entrance permit, paid on arrival.</p>
  </div>
</div>
`,
        price: 699,
        maxPeoplePerSlot: 16,
        timeStart: '10:00 AM',
        timeEnd: '17:00 PM',
        dates: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
        imgUrl: 'assets/images/activities/atlantis-dune-quad-biking-02.avif',
        gallery: [
            'assets/images/activities/atlantis-dune-quad-biking-01.avif',
            'assets/images/activities/atlantis-dune-quad-biking-02.avif',
            'assets/images/activities/atlantis-dune-quad-biking-03.avif',
            'assets/images/activities/atlantis-dune-quad-biking-04.avif',
            'assets/images/activities/atlantis-dune-quad-biking-05.avif'
        ],
        exclusionNote: 'Excludes R250 nature reserve entrance permit, paid on arrival.',
        addons: [],
        merchantProductType: 'Adventure tours > Quad biking > Atlantis Dunes'
    },
    {
        id: 'ca-atlantis-dune-quad-40min',
        slug: 'atlantis-dune-quad-biking-40min',
        title: 'Atlantis dune quad biking 40min',
        shortDescription:
            'Experience the thrill of off-road adventure as you embark on an exhilarating quadbike tour at Atlantis Dunes, Cape Town. Get ready to rev your engine and create unforgettable memories.',
        fullDescription: `
<div class="space-y-3 text-sm text-gray-700 leading-snug">
  <p>
    Get ready for an adrenaline-pumping adventure as you embark on a thrilling <strong>quadbike experience</strong> at <strong>Atlantis Dunes, Cape Town</strong>. This action-packed activity offers a unique opportunity to explore the stunning natural landscapes of the dunes while enjoying the exhilaration of off-road quadbiking.
  </p>

  <p>
    Your adventure begins with a safety briefing and equipment fitting by our experienced guides, who will ensure that you are comfortable and ready for the ride. Then, hop on your quadbike and rev your engine as you embark on an exciting journey through the picturesque Atlantis Dunes.
  </p>

  <div>
    <h4 class="font-bold text-base mb-1">Highlights</h4>
    <ul class="list-disc ml-5 space-y-0.5">
      <li>Guided quadbike tour at Atlantis Dunes</li>
      <li>Safety briefing and equipment fitting</li>
      <li>Off-road dune riding through natural landscapes</li>
      <li>Adrenaline-filled Cape Town adventure</li>
    </ul>
  </div>

  <div>
    <h4 class="font-bold text-base mb-1">Inclusions &amp; exclusions</h4>
    <p class="mb-0.5"><span class="font-semibold">Includes:</span> guided quadbike tour, safety briefing, equipment fitting, guide.</p>
    <p class="mb-0"><span class="font-semibold">Not included:</span> R250 nature reserve entrance permit, paid on arrival.</p>
  </div>
</div>
`,
        price: 499,
        maxPeoplePerSlot: 16,
        timeStart: '10:00 AM',
        timeEnd: '17:00 PM',
        dates: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
        imgUrl: 'assets/images/activities/atlantis-dune-quad-biking-02.avif',
        gallery: [
            'assets/images/activities/atlantis-dune-quad-biking-01.avif',
            'assets/images/activities/atlantis-dune-quad-biking-02.avif',
            'assets/images/activities/atlantis-dune-quad-biking-03.avif',
            'assets/images/activities/atlantis-dune-quad-biking-04.avif',
            'assets/images/activities/atlantis-dune-quad-biking-05.avif'
        ],
        exclusionNote: 'Excludes R250 nature reserve entrance permit, paid on arrival.',
        addons: [],
        merchantProductType: 'Adventure tours > Quad biking > Atlantis Dunes'
    }
];
