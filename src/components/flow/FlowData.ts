export interface FlowNodeData {
  id: string
  label: string
  x: number
  y: number
  color: string
  icon: string
  description: string
  detail: string
  whyMatters: string
}

export interface FlowConnectionData {
  from: string
  to: string
  isReturn: boolean
}

export interface FlowPhase {
  index: number
  label: string
  subtitle: string
  description: string
  connectionIndices: number[]
}

export const NODES: FlowNodeData[] = [
  {
    id: 'browser',
    label: 'Browser',
    x: 70, y: 250,
    color: '#00E5FF',
    icon: 'W',
    description: 'Where your journey begins.',
    detail: 'When you type a URL and press Enter, the browser parses the address, checks its local cache for a previously resolved IP, and determines the protocol (HTTP/1.1, HTTP/2, or HTTP/3). If the domain is not cached, it initiates a DNS lookup.',
    whyMatters: 'Browser caching, connection pooling, and protocol negotiation are the first line of defense for fast page loads. Chrome alone handles billions of DNS queries daily.'
  },
  {
    id: 'dns',
    label: 'DNS',
    x: 185, y: 250,
    color: '#8B5CF6',
    icon: 'D',
    description: 'The phonebook of the Internet.',
    detail: 'DNS (Domain Name System) translates human-readable domain names like google.com into machine-readable IP addresses like 142.250.80.46. The resolver queries a hierarchy: root servers → TLD servers (.com, .org) → authoritative nameservers that hold the actual DNS records.',
    whyMatters: 'DNS is one of the most critical — and most attacked — parts of the Internet. Cache poisoning, DDoS amplification, and DNS hijacking are constant threats. DNSSEC and encrypted DNS (DoH, DoT) help secure this layer.'
  },
  {
    id: 'isp',
    label: 'ISP',
    x: 300, y: 250,
    color: '#FF3D8A',
    icon: 'I',
    description: 'Your gateway to the Internet.',
    detail: 'Your Internet Service Provider (Comcast, Verizon, AT&T, or a local ISP) routes your traffic from your home modem through their regional network. ISPs operate at multiple tiers — Tier 1 ISPs own the physical fiber backbone, while Tier 2 and Tier 3 ISPs buy access from them.',
    whyMatters: 'ISP peering agreements and routing policies directly affect your latency. A congested ISP peering point can add 100ms+ to your connection. This is why CDNs are essential — they bypass ISP congestion by serving from edge locations.'
  },
  {
    id: 'backbone',
    label: 'Backbone',
    x: 415, y: 250,
    color: '#FFB300',
    icon: 'B',
    description: 'The Internet\'s superhighway.',
    detail: 'The Internet backbone is a global network of fiber-optic cables, both terrestrial and submarine. Over 400 submarine cables span the ocean floor, carrying 99% of international data traffic. Each cable contains hair-thin glass fibers that transmit data as pulses of light.',
    whyMatters: 'Backbone infrastructure is incredibly resilient — redundant paths mean a cut cable in one ocean reroutes through another. But physical limitations (speed of light in fiber ≈ 200,000 km/s) mean latency is fundamentally bounded by geography.'
  },
  {
    id: 'cdn',
    label: 'CDN',
    x: 530, y: 250,
    color: '#00F593',
    icon: 'C',
    description: 'Bringing content closer to you.',
    detail: 'Content Delivery Networks (Cloudflare, Fastly, Akamai, AWS CloudFront) cache static assets — images, CSS, JavaScript, and even HTML — at hundreds of edge locations worldwide. When you request example.com, the CDN serves cached content from the edge node nearest to you, bypassing the entire origin journey.',
    whyMatters: 'CDNs serve over 70% of all web traffic. They reduce latency from hundreds of milliseconds to single digits for cached content. They also absorb DDoS attacks by distributing traffic across their global network.'
  },
  {
    id: 'lb',
    label: 'Load Balancer',
    x: 645, y: 250,
    color: '#00E5FF',
    icon: 'L',
    description: 'Distributing traffic across servers.',
    detail: 'A load balancer sits in front of your server fleet and distributes incoming requests using algorithms like round-robin (take turns), least-connections (send to least busy server), or IP hash (same user → same server). It also performs health checks — if a server fails to respond, it\'s removed from the pool.',
    whyMatters: 'Load balancers are the single most important scaling tool. They handle SSL termination (decrypting HTTPS at the edge to reduce server load), session persistence, and graceful degradation when servers fail.'
  },
  {
    id: 'web',
    label: 'Web Server',
    x: 760, y: 250,
    color: '#8B5CF6',
    icon: 'W',
    description: 'Serving pages and proxying requests.',
    detail: 'Web servers like Nginx, Apache, and Caddy handle incoming HTTP requests. They serve static files (HTML, images, JS) directly from disk and proxy dynamic requests to the application server. Nginx uses an event-driven, asynchronous architecture that handles 10,000+ concurrent connections with minimal memory.',
    whyMatters: 'Web servers are the first point of contact for your application code. Proper configuration of timeouts, buffer sizes, and connection limits separates a robust deployment from a fragile one.'
  },
  {
    id: 'app',
    label: 'App Server',
    x: 875, y: 250,
    color: '#FF3D8A',
    icon: 'A',
    description: 'Where your backend code runs.',
    detail: 'The application server executes your business logic — Node.js, Python (Django/Flask), Ruby on Rails, Java Spring, Go, or any other backend runtime. It processes the request, queries databases, calls external APIs, and constructs the response. Most app servers are stateless — they can scale horizontally by adding more instances.',
    whyMatters: 'App server architecture determines your scalability. Stateless apps scale horizontally trivially (just add instances). Stateful apps require external session stores (Redis) or sticky sessions. Cold starts (first request latency) are a critical concern for serverless platforms.'
  },
  {
    id: 'db',
    label: 'Database',
    x: 990, y: 250,
    color: '#FFB300',
    icon: 'D',
    description: 'The source of truth.',
    detail: 'Databases store and retrieve your data — PostgreSQL, MySQL, MongoDB, Redis, and more. The app server sends SQL queries (or NoSQL operations) to read or write data. Databases use indexes to speed up queries, transactions to ensure consistency, and replication to survive server failures.',
    whyMatters: 'The database is almost always the bottleneck in a web application. Query optimization, proper indexing, connection pooling, and caching strategies directly determine your application\'s performance under load.'
  }
]

export const CONNECTIONS: FlowConnectionData[] = [
  { from: 'browser', to: 'dns', isReturn: false },
  { from: 'dns', to: 'isp', isReturn: false },
  { from: 'isp', to: 'backbone', isReturn: false },
  { from: 'backbone', to: 'cdn', isReturn: false },
  { from: 'cdn', to: 'lb', isReturn: false },
  { from: 'lb', to: 'web', isReturn: false },
  { from: 'web', to: 'app', isReturn: false },
  { from: 'app', to: 'db', isReturn: false },
  { from: 'db', to: 'app', isReturn: true },
  { from: 'app', to: 'web', isReturn: true },
  { from: 'web', to: 'lb', isReturn: true },
  { from: 'lb', to: 'cdn', isReturn: true },
  { from: 'cdn', to: 'backbone', isReturn: true },
  { from: 'backbone', to: 'isp', isReturn: true },
  { from: 'isp', to: 'browser', isReturn: true },
]

export const PHASES: FlowPhase[] = [
  {
    index: 0,
    label: 'DNS Lookup',
    subtitle: 'Finding the IP',
    description: 'The browser asks DNS: "Where is this website?" The resolver climbs the DNS hierarchy — root, TLD, authoritative — and returns the server\'s IP address.',
    connectionIndices: [0]
  },
  {
    index: 1,
    label: 'Routing',
    subtitle: 'Through the network',
    description: 'The request leaves your home network through your ISP, which routes it through the Internet backbone — a global mesh of fiber-optic cables spanning continents and oceans.',
    connectionIndices: [1, 2]
  },
  {
    index: 2,
    label: 'Edge Delivery',
    subtitle: 'CDN intercepts',
    description: 'The request reaches a CDN edge server. If the content is cached here (static assets, images, HTML), the response starts immediately — no need to travel further.',
    connectionIndices: [3]
  },
  {
    index: 3,
    label: 'Origin Forwarding',
    subtitle: 'To the source',
    description: 'If the content isn\'t cached (cache miss), the CDN forwards the request to the origin server through the load balancer.',
    connectionIndices: [4]
  },
  {
    index: 4,
    label: 'Server Processing',
    subtitle: 'Handling the request',
    description: 'The load balancer picks a healthy web server, which serves static files or proxies to the app server. Your backend code processes the request — authentication, business logic, data validation.',
    connectionIndices: [5, 6]
  },
  {
    index: 5,
    label: 'Data Access',
    subtitle: 'Querying the database',
    description: 'The app server sends a query to the database. The database looks up the data using indexes, executes the query, and returns the results. This is the turning point — the response begins its journey back.',
    connectionIndices: [7, 8]
  },
  {
    index: 6,
    label: 'Response Assembly',
    subtitle: 'Building the reply',
    description: 'The database results flow back: app server assembles them into an HTTP response (JSON, HTML), web server adds headers, and the load balancer forwards toward the CDN.',
    connectionIndices: [9, 10, 11]
  },
  {
    index: 7,
    label: 'Delivery',
    subtitle: 'Back to you',
    description: 'The CDN caches the response for next time, then sends it through the backbone, across your ISP, to your browser. The page renders — the entire round trip in under a second.',
    connectionIndices: [12, 13, 14]
  }
]

export function getNode(id: string): FlowNodeData | undefined {
  return NODES.find(n => n.id === id)
}

export function getConnection(index: number): FlowConnectionData | undefined {
  return CONNECTIONS[index]
}

export function getPhaseConnections(phaseIndex: number): FlowConnectionData[] {
  const phase = PHASES.find(p => p.index === phaseIndex)
  if (!phase) return []
  return phase.connectionIndices.map(i => CONNECTIONS[i]).filter(Boolean)
}

export function getConnectionIndex(fromId: string, toId: string): number {
  return CONNECTIONS.findIndex(c => c.from === fromId && c.to === toId)
}

export const FORWARD_Y = 190
export const RETURN_Y = 310
export const NODE_Y = 250
