# Advon Web

Aplicacao React com Vite para a experiencia institucional e o portal operacional.

## Variaveis de ambiente

O frontend usa a URL da API por meio da variavel `VITE_API_BASE_URL`.

Arquivos atuais:

- `.env`
- `.env.production`

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build de producao

```bash
npm run build
```

Os arquivos finais serao gerados em `dist/`.

## Publicacao sem Docker

1. Rode `npm run build`.
2. Envie o conteudo da pasta `dist/` para a hospedagem.
3. Configure o servidor para sempre responder `index.html` nas rotas do React.

Isso e importante para links como:

- `/login`
- `/dashboard`
- `/processes/123`

Sem esse fallback, a aplicacao funciona ao navegar internamente, mas pode falhar ao atualizar a pagina direto em uma rota.
