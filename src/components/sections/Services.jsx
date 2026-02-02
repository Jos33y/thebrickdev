/**
 * Services - What We Build section
 * True Bento Brick layout with varied card sizes
 */

import {
  WebsiteIcon,
  EcommerceIcon,
  WebAppIcon,
  MobileAppIcon,
  ApiIcon,
  MvpIcon,
  FinTechIcon,
  BlockchainIcon,
  MaintenanceIcon
} from '../common/ServiceIcons';

const services = [
  {
    id: 'websites',
    number: '01',
    icon: WebsiteIcon,
    title: 'Websites That Convert',
    description: 'Landing pages, business sites, and portfolios designed to turn visitors into customers. Fast, responsive, and built to rank.',
    features: ['SEO Optimized', 'Mobile-First', 'Fast Loading'],
    size: 'large'
  },
  {
    id: 'ecommerce',
    number: '02',
    icon: EcommerceIcon,
    title: 'E-commerce That Sells',
    description: 'Online stores with seamless checkout and inventory management.',
    size: 'small'
  },
  {
    id: 'webapps',
    number: '03',
    icon: WebAppIcon,
    title: 'Web Apps That Scale',
    description: 'Custom dashboards, booking systems, and internal tools.',
    size: 'small'
  },
  {
    id: 'mobile',
    number: '04',
    icon: MobileAppIcon,
    title: 'Mobile Apps',
    description: 'Native and cross-platform apps for iOS and Android. From concept to App Store, we handle the entire journey.',
    features: ['iOS & Android', 'Cross-Platform', 'App Store Ready'],
    size: 'large'
  },
  {
    id: 'api',
    number: '05',
    icon: ApiIcon,
    title: 'API & Backend',
    description: 'Robust server architecture, database design, and API development. The invisible foundation that powers everything.',
    features: ['REST & GraphQL', 'Database Design', 'Cloud Deploy'],
    size: 'large'
  },
  {
    id: 'mvp',
    number: '06',
    icon: MvpIcon,
    title: 'MVP Development',
    description: 'Launch fast, learn faster. Get your product to market quickly.',
    size: 'small'
  },
  {
    id: 'fintech',
    number: '07',
    icon: FinTechIcon,
    title: 'FinTech & Trading',
    description: 'Exchanges, trading platforms, wallets, and payment systems.',
    size: 'small'
  },
  {
    id: 'blockchain',
    number: '08',
    icon: BlockchainIcon,
    title: 'Blockchain & Web3',
    description: 'Smart contracts, dApps, and DeFi integrations. Bringing your business to the decentralized web with security first.',
    features: ['Smart Contracts', 'DeFi Ready', 'Wallet Integration'],
    size: 'large'
  },
  {
    id: 'maintenance',
    number: '09',
    icon: MaintenanceIcon,
    title: 'Maintenance & Support',
    description: 'Your project doesn\'t end at launch. Ongoing updates, security patches, performance monitoring, and dedicated support to keep everything running smooth.',
    size: 'full'
  }
];

const Services = () => {
  return (
    <section className="section section-alt" id="services">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-label">What We Build</span>
          <h2 className="section-title">Everything you need to launch and grow</h2>
          <p className="section-description">
            From first idea to ongoing support. We handle the technical so you can focus on your business.
          </p>
        </div>

        {/* Bento Brick Grid */}
        <div className="services-bento">
          {services.map((service) => (
            <article
              key={service.id}
              className={`service-brick service-brick--${service.id}`}
              data-size={service.size}
            >
              <div className="service-brick__header">
                <span className="service-brick__number">{service.number}</span>
                <div className="service-brick__icon">
                  <service.icon size={service.size === 'full' ? 32 : service.size === 'large' ? 32 : 28} />
                </div>
              </div>
              
              <div className="service-brick__content">
                <h3 className="service-brick__title">{service.title}</h3>
                <p className="service-brick__description">{service.description}</p>
                
                {service.features && (
                  <div className="service-brick__features">
                    {service.features.map((feature, i) => (
                      <span key={i} className="service-brick__feature">{feature}</span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;