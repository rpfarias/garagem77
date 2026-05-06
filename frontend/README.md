# Garagem77 Frontend

Frontend SaaS para gerenciamento de lava jato e estética automotiva.

## 🚀 Tecnologias

- **Next.js 14+** - Framework React moderno com App Router
- **TypeScript** - Tipagem estática para JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management leve
- **Axios** - HTTP client para API
- **React Hot Toast** - Notificações elegantes

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Backend rodando em `http://localhost:8080/api` (ou configure em `.env.local`)

## 🛠️ Setup Inicial

### 1. Instalar Dependências

```bash
cd frontend
npm install
# ou
yarn install
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env.local
```

**Editar `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_ENVIRONMENT=development
```

### 3. Executar em Desenvolvimento

```bash
npm run dev
# ou
yarn dev
```

Acesse: http://localhost:3000

## 🎯 Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/                    # Páginas (Next.js App Router)
│   │   ├── layout.tsx          # Layout raiz
│   │   ├── login/              # Página de login
│   │   └── dashboard/          # Dashboard principal
│   ├── components/             # Componentes React
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Layout.tsx
│   │   └── Navbar.tsx
│   ├── context/                # Estado global (Zustand)
│   │   └── auth.ts            # Store de autenticação
│   ├── hooks/                  # Hooks customizados
│   │   ├── useAuth.ts         # Hook de autenticação
│   │   └── useFetch.ts        # Hook para requisições
│   ├── services/               # Serviços/API Client
│   │   └── api.ts             # Cliente Axios
│   ├── types/                  # Tipos TypeScript
│   │   └── index.ts           # Tipos globais
│   ├── styles/                 # CSS Global
│   │   └── globals.css
│   └── lib/                    # Utilitários
├── public/                     # Arquivos estáticos
├── .env.example                # Exemplo de variáveis
├── next.config.js              # Configuração Next.js
├── tsconfig.json               # Configuração TypeScript
├── tailwind.config.js          # Configuração Tailwind
└── package.json                # Dependências
```

## 🔐 Autenticação

### Login

1. Acesse **http://localhost:3000/login**
2. Use credenciais de teste:
   - Email: `admin@garagem77.com`
   - Senha: `password123`
3. Token JWT é armazenado em `localStorage`
4. Redirecionado para `/dashboard`

### Logout

- Clique em "Sair" na navbar
- Token é removido
- Redirecionado para `/login`

### Proteção de Rotas

Componentes como `<Layout requireAuth={true}>` protegem rotas automaticamente:

```tsx
<Layout requireAuth={true}>
  {/* Conteúdo protegido - só acesso com autenticação */}
</Layout>
```

## 🎨 Componentes

### Button

```tsx
<Button variant="primary" size="md" fullWidth>
  Clique aqui
</Button>
```

**Variantes:** `primary`, `secondary`, `danger`, `ghost`  
**Tamanhos:** `sm`, `md`, `lg`

### Input

```tsx
<Input 
  label="Email"
  type="email"
  placeholder="seu@email.com"
  error={errors.email}
  helpText="Seu email de acesso"
/>
```

### Card

```tsx
<Card>
  <CardHeader>
    <h2>Título</h2>
  </CardHeader>
  <CardBody>
    Conteúdo aqui
  </CardBody>
  <CardFooter>
    Rodapé aqui
  </CardFooter>
</Card>
```

## 🔌 API Integration

### Fetch Data

```tsx
import { useFetch } from '@/hooks/useFetch';

function MyComponent() {
  const { data, error, isLoading, refetch } = useFetch('/customers');

  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p>Erro ao carregar</p>;

  return <div>{/* renderizar data */}</div>;
}
```

### Autenticação Automática

Todos os requests incluem token automaticamente:

```tsx
import { apiClient } from '@/services/api';

const customers = await apiClient.get('/customers');
```

## 📦 Build para Produção

```bash
npm run build
npm start
```

Ou deploy direto em plataformas como **Vercel**:

```bash
npm install -g vercel
vercel --prod
```

## 🧹 Lint e Formatação

```bash
# Verificar erros de linting
npm run lint

# Formatar código
npm run format

# Verificar tipos TypeScript
npm run type-check
```

## 📚 Próximos Passos

- [ ] Página de Clientes com CRUD
- [ ] Página de Agendamentos
- [ ] Relatórios e Gráficos
- [ ] Integração com Payment Gateway
- [ ] Testes com Jest/React Testing Library
- [ ] Progressive Web App (PWA)
- [ ] Dark Mode
- [ ] Internacionalização (i18n)

## 🐛 Troubleshooting

### Erro: "Cannot find module '@/...'"

Verificar `tsconfig.json` > `compilerOptions.paths` estão corretos.

### Erro: "401 Unauthorized"

- Token expirado → fazer login novamente
- Backend não está rodando → iniciar em http://localhost:8080
- Verificar `.env.local` tem `NEXT_PUBLIC_API_URL` correto

### Erro: "Tailwind CSS não carrega"

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 📖 Documentação

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [Axios](https://axios-http.com/docs/intro)

## 👥 Contribuindo

1. Criar branch: `git checkout -b feature/sua-feature`
2. Commit: `git commit -m "feat: descrição da feature"`
3. Push: `git push origin feature/sua-feature`
4. Abrir Pull Request

## 📝 Licença

Proprietária © 2024 Garagem77
