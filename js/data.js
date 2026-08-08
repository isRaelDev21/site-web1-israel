/* =========================================================
   COMPIA Editora — dados iniciais (catálogo "semente")
   Estes dados são carregados no localStorage na primeira
   visita e podem ser editados depois pelo Painel Admin.
   ========================================================= */

const COMPIA_SEED_PRODUCTS = [
  {
    id: "p01",
    title: "Fundamentos de Inteligência Artificial",
    category: "Inteligência Artificial",
    tags: ["ia", "fundamentos", "graduação"],
    format: "fisico",
    price: 99.90,
    stock: 24,
    weightKg: 0.6,
    image: "livro-fundamentos-ia.jpg",
    description: "Uma introdução sólida aos conceitos centrais de IA — busca, aprendizado de máquina, redes neurais e ética — pensada para quem está começando na área ou quer organizar o conhecimento que já tem."
  },
  {
    id: "p02",
    title: "Arquitetura de Software Inteligente",
    category: "Arquitetura de Software",
    tags: ["arquitetura", "software", "ia"],
    format: "fisico",
    price: 89.90,
    stock: 18,
    weightKg: 0.55,
    image: "livro-arquitetura-software-inteligente.jpg",
    description: "Como projetar sistemas que incorporam modelos de IA em produção: padrões de arquitetura, escalabilidade, observabilidade e decisões de design que resistem ao tempo."
  },
  {
    id: "p03",
    title: "Redes Neurais na Prática",
    category: "Inteligência Artificial",
    tags: ["ia", "redes neurais", "avançado"],
    format: "fisico",
    price: 109.90,
    stock: 12,
    weightKg: 0.7,
    image: "livro-redes-neurais-na-pratica.jpg",
    description: "Do perceptron aos transformers: um percurso prático por arquiteturas de redes neurais, com exercícios e estudos de caso reais de projetos de mercado."
  },
  {
    id: "p04",
    title: "Blockchain na Prática",
    category: "Blockchain",
    tags: ["blockchain", "cripto", "prática"],
    format: "fisico",
    price: 79.90,
    stock: 20,
    weightKg: 0.5,
    image: "livro-blockchain-na-pratica.jpg",
    description: "Os fundamentos de blockchain explicados sem rodeios: consenso, contratos inteligentes, casos de uso corporativos e os limites reais da tecnologia."
  },
  {
    id: "p05",
    title: "Cibersegurança Essencial",
    category: "Cibersegurança",
    tags: ["segurança", "cibersegurança", "fundamentos"],
    format: "fisico",
    price: 94.90,
    stock: 16,
    weightKg: 0.6,
    image: "livro-ciberseguranca-essencial.jpg",
    description: "Um guia direto sobre as ameaças mais comuns, boas práticas de defesa e como estruturar uma cultura de segurança em times de tecnologia."
  },
  {
    id: "p06",
    title: "Criptografia Aplicada",
    category: "Criptografia",
    tags: ["criptografia", "segurança", "e-book"],
    format: "ebook",
    price: 49.90,
    stock: 999,
    weightKg: 0,
    image: "ebook-criptografia-aplicada.jpg",
    description: "Da criptografia clássica às curvas elípticas: como os algoritmos que protegem dados no dia a dia realmente funcionam, com exemplos aplicados."
  },
  {
    id: "p07",
    title: "Machine Learning Avançado",
    category: "Inteligência Artificial",
    tags: ["ia", "machine learning", "e-book"],
    format: "ebook",
    price: 59.90,
    stock: 999,
    weightKg: 0,
    image: "ebook-machine-learning-avancado.jpg",
    description: "Técnicas avançadas de aprendizado de máquina para quem já domina o básico: ensemble, otimização, deployment e monitoramento de modelos."
  },
  {
    id: "p08",
    title: "Ética e Governança em IA",
    category: "Inteligência Artificial",
    tags: ["ia", "ética", "governança", "e-book"],
    format: "ebook",
    price: 39.90,
    stock: 999,
    weightKg: 0,
    image: "ebook-etica-governanca-ia.jpg",
    description: "Um panorama sobre os dilemas éticos da IA e como organizações vêm estruturando políticas internas de governança responsável."
  },
  {
    id: "p09",
    title: "Kit Iniciante em IA",
    category: "Kits",
    tags: ["kit", "ia", "iniciante"],
    format: "kit",
    price: 219.90,
    stock: 10,
    weightKg: 1.6,
    image: "kit-iniciante-ia.jpg",
    description: "Os três livros essenciais para começar em IA: Fundamentos de Inteligência Artificial, Redes Neurais na Prática e Ética e Governança em IA (impresso + e-book)."
  },
  {
    id: "p10",
    title: "Kit Blockchain & Criptografia",
    category: "Kits",
    tags: ["kit", "blockchain", "criptografia"],
    format: "kit",
    price: 129.90,
    stock: 8,
    weightKg: 1.1,
    image: "kit-blockchain-criptografia.jpg",
    description: "Combo com Blockchain na Prática (físico) e Criptografia Aplicada (e-book) para quem quer entender a base técnica por trás das moedas digitais."
  }
];

/* Lista de arquivos de imagem esperados — usada pelo painel
   admin para lembrar o nome de arquivo ao cadastrar produtos. */
const COMPIA_EXPECTED_IMAGES = COMPIA_SEED_PRODUCTS.map(p => p.image).concat(["logo-compia.png"]);
