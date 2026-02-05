/**
 * The Brick Dev - Portfolio Data
 * All project, service, and contact information
 */

// ==========================================================================
// PROJECTS
// ==========================================================================

export const projects = [
  {
    id: 'brickdev-portal',
    name: 'Business Management System',
    url: null,
    category: 'Management Portal',
    status: 'live',
    tagline: 'Run your business from one dashboard.',
    description: 'A complete business management system built for The Brick Dev Studios. Tracks prospects, clients, invoices, payments, and revenue goals all in one place. Every feature was built to solve a real operational need.',
    outcomes: [
      'Real-time revenue dashboard with financial goals',
      'Full CRM with prospect pipeline and email outreach',
      'Invoice generation with PDF export and email delivery',
      'Payment tracking across multiple currencies'
    ],
    techStack: ['React 19', 'Vite', 'Supabase', 'Recharts', 'Resend'],
    screenshot: '/projects/brickdev_portal_dashboard.png',
  },
  {
    id: 'locappoint',
    name: 'LocAppoint',
    url: 'https://locappoint.com',
    category: 'Web Application',
    status: 'live',
    tagline: 'Get Discovered. Get Booked. Grow Your Business.',
    description: 'The all-in-one booking platform for local businesses. Accept bookings 24/7 and grow your revenue on autopilot.',
    outcomes: [
      'Businesses accept bookings 24/7 without manual work',
      'Dashboard shows real-time revenue, bookings & ratings',
      'Free to start - no technical skills needed',
      'Built for EU market compliance (GDPR)'
    ],
    techStack: ['React 19', 'Vite', 'Supabase', 'Framer Motion', 'i18next'],
    screenshot: '/projects/locappoint_hero_page.png',
  },
  {
    id: 'hairbytimablaq',
    name: 'HairByTimaBlaq',
    url: 'https://hairbytimablaq.com',
    category: 'E-commerce',
    status: 'live',
    tagline: 'Welcome, Queens!',
    description: 'Premium luxury hair extensions e-commerce platform with full admin control.',
    outcomes: [
      '4.9 average rating from customers',
      '94% 5-star reviews',
      'Handles international orders',
      'Owner manages everything from admin panel'
    ],
    techStack: ['React 19', 'Vite', 'Supabase', 'TanStack Query', 'Zustand'],
    screenshot: '/projects/hairbytimablaq_hero_page.png',
  },
  {
    id: 'blacktribe-fashion',
    name: 'BlackTribe Fashion',
    url: 'https://blacktribefashion.com',
    category: 'E-commerce',
    status: 'live',
    tagline: 'Own Your Style And Define Your Fashion Identity!',
    description: 'African fashion e-commerce with full admin dashboard and order management.',
    outcomes: [
      'Brand selling "The Beast Within" collection online',
      'Owner manages entire business from dashboard',
      'International customers with USD pricing',
      'Physical store in Portugal integrated'
    ],
    techStack: ['React 18', 'Firebase', 'Node.js', 'Express', 'Chart.js'],
    screenshot: '/projects/blacktribefashion_hero_page.png',
  },
  {
    id: 'opsyn-tech',
    name: 'Opsyn Technologies',
    url: 'https://opsyn.tech',
    category: 'Business Website',
    status: 'live',
    tagline: 'We install. We maintain. We deliver.',
    description: 'Professional business website with client management and invoice generation system.',
    outcomes: [
      '10+ years, 100+ projects, 100% guaranteed displayed',
      'Professional invoices generated in seconds',
      'All clients tracked in one place',
      'Footer credit: "Built by The Brick Dev"'
    ],
    techStack: ['React 19', 'Vite', 'Supabase', 'Recharts', 'jsPDF'],
    screenshot: '/projects/opsyntechnologies_hero_page.png',
  },
  {
    id: 'novapay',
    name: 'NovaPay',
    url: null,
    category: 'FinTech Platform',
    status: 'development',
    tagline: 'Send Money Across Africa Sharp Sharp',
    description: "Africa's open street marketplace for cross-border payments. P2P transfers across Nigeria, Ghana, and Ivory Coast with street rates and zero delays.",
    outcomes: [
      'P2P marketplace - no middleman',
      'USDT escrow protection',
      'Cross-border fiat-to-fiat transfers',
      '2-3% better than bank rates'
    ],
    techStack: ['React 19', 'Vite', 'Supabase', 'USDT TRC20', 'Upstash Redis'],
    screenshot: '/projects/nova_pay_hero.png',
  },
];


// ==========================================================================
// STATS
// ==========================================================================

export const stats = {
  yearsExperience: '5+',
  completedProjects: '45+',
  happyClients: '27',
};


// ==========================================================================
// SERVICES / PRICING
// ==========================================================================

export const pricing = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Business websites, landing pages, portfolios',
    price: '$1,500',
    priceNote: 'Starting from',
    timeline: '2-3 weeks',
    includes: [
      'Custom design',
      'Mobile responsive',
      'Contact form',
      'Basic SEO setup',
      'Social media links',
      '30-day support'
    ],
    cta: 'Get Started',
    highlighted: false
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Management portals, e-commerce, booking systems',
    price: '$3,500',
    priceNote: 'Starting from',
    timeline: '4-6 weeks',
    includes: [
      'Everything in Starter',
      'Custom management dashboard',
      'Client or inventory tracking',
      'Payment integration',
      'Email notifications',
      'Reports and analytics',
      '45-day support'
    ],
    cta: 'Get Started',
    highlighted: true
  },
  {
    id: 'scale',
    name: 'Scale',
    description: 'Complex systems, multi-feature platforms',
    price: '$7,000+',
    priceNote: 'Starting from',
    timeline: '6-10 weeks',
    includes: [
      'Everything in Growth',
      'Complex business logic',
      'API integrations',
      'Role-based access control',
      'Advanced analytics',
      'Third-party integrations',
      '60-day support'
    ],
    cta: 'Get Started',
    highlighted: false
  }
];


// ==========================================================================
// PROCESS
// ==========================================================================

export const process = [
  {
    step: 1,
    title: 'Discovery',
    description: 'We learn about your business, goals, and what success looks like.'
  },
  {
    step: 2,
    title: 'Proposal',
    description: 'You get a clear scope, timeline, and investment breakdown.'
  },
  {
    step: 3,
    title: 'Build',
    description: "We build with weekly updates. You're always in the loop."
  },
  {
    step: 4,
    title: 'Launch',
    description: 'We handle deployment, training, and make sure everything works.'
  },
  {
    step: 5,
    title: 'Support',
    description: '30 days included. Retainers available for ongoing work.'
  }
];


// ==========================================================================
// CONTACT
// ==========================================================================

export const contact = {
  email: 'hello@thebrickdev.com',
  phone: '+2348162438553',
  whatsapp: '+2348162438553',
  telegram: '@jos3333y',
  timezone: 'GMT+1',
  social: {
    linkedin: 'https://www.linkedin.com/in/joseph-lagbalu/',
    github: 'https://github.com/Jos33y',
    instagram: 'https://www.instagram.com/the_brickdev/',
    twitter: 'https://x.com/boy__programmer',
    telegram: 'https://t.me/jos3333y',
    upwork: 'https://www.upwork.com/freelancers/~01fc04df6c73d0b430'
  }
};


// ==========================================================================
// DEFAULT EXPORT
// ==========================================================================

export default {
  projects,
  stats,
  pricing,
  process,
  contact
};