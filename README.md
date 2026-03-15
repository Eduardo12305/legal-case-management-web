# Advon Web

Aplicacao React com Vite para a experiencia institucional e o portal operacional.

## Variaveis de ambiente

O frontend usa a URL da API por meio da variavel `VITE_API_BASE_URL`.

Arquivos atuais:

- `.env`
- `.env.production`
- `.env.example`

## Desenvolvimento

```bash
npm install
npm run dev
```

## Publicacao sem Docker

O arquivo inicial para hospedagem Node e:

- `server.js`

Partindo da raiz, o caminho e:

- `server.js`

Esse arquivo:

- gera o build automaticamente ao iniciar;
- serve a pasta `dist/`;
- responde `index.html` nas rotas do React.

### Comando de inicializacao

Se a plataforma aceitar comando de start:

```bash
npm start
```

Se ela pedir apenas o arquivo inicial, use:

```text
server.js
```

### Fluxo

1. Rode `npm install`.
2. Inicie com `npm start` ou configure `server.js` como arquivo inicial.

Isso e importante para links como:

- `/login`
- `/dashboard`
- `/processes/123`

Sem esse fallback, a aplicacao funciona ao navegar internamente, mas pode falhar ao atualizar a pagina direto em uma rota.

## Hosting estatico

Se a plataforma pedir:

- comando de construcao: `npm run build`
- diretorio de saida: `dist`
- gerenciador de pacotes: `npm`

entao ela esta publicando o frontend como SPA estatica.

Nesse caso, o fallback das rotas do React deve ser feito pelo arquivo:

- `public/.htaccess`

Esse arquivo vai para o build final e redireciona rotas como `/chat` e `/processes/123` para `index.html`.
