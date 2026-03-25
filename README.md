# Arquivo do Bem - Backend (Strapi + PostgreSQL)

Este é o projeto backend da aplicação **Arquivo do Bem**, estruturado via CMS Strapi e banco de dados PostgreSQL.

---

## ⚠️ Pré-requisitos

Para rodar este projeto localmente, as seguintes ferramentas devem estar instaladas:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (versão 20 recomendada)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)

---

## 🚀 Como executar o Backend localmente

Siga o passo a passo abaixo para colocar o servidor e o banco de dados no ar:

### 1. Clonar e acessar o projeto
```bash
git clone <URL_DO_REPOSITORIO>
cd arquivo-do-bem-strapi
```
*(Substitua `<URL_DO_REPOSITORIO>` pela URL correta do repositório)*

### 2. Configurar as variáveis de ambiente
Crie o arquivo de configuração com base no arquivo de exemplo. Isso é fundamental para a conexão com o banco de dados.
```bash
copy .env.example .env
```
*(No Windows, você pode simplesmente copiar e colar o arquivo no Explorador de Arquivos e renomear a cópia como `.env`).*

Certifique-se de que os campos de conexão do banco de dados (`DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_NAME`, etc.) estão devidamente preenchidos dentro do arquivo `.env`.

### 3. Subir o Banco de Dados (Docker)
Inicie o container do PostgreSQL (e do Adminer) em segundo plano:
```bash
docker-compose up -d
```
*O banco de dados precisa estar rodando antes de você prosseguir, pois as conexões serão estabelecidas na próxima etapa.*

### 4. Instalar as dependências do Node.js
Dentro da pasta `arquivo-do-bem-strapi`, rode:
```bash
npm install
```

### 5. Iniciar o servidor Strapi
Depois que todas as dependências forem concluídas e o banco de dados via Docker estiver rodando:
```bash
npm run develop
```
O console mostrará que o servidor está pronto (ex: `The server is running!`).

### 6. Criar o Primeiro Usuário (Administrador)
Para acessar e gerenciar a interface do Strapi, você precisará criar o usuário administrador inicial:
1. Acesse o painel admin em: [http://localhost:1337/admin](http://localhost:1337/admin)
2. Como é a sua primeira vez rodando o projeto limpo, o Strapi exigirá a criação de um usuário. Ele exibirá automaticamente um formulário de registro.
3. Preencha seus dados (Nome, E-mail e Senha) para criar o perfil **Super Admin**.
4. Faça o login. Pronto! Você terá acesso completo ao painel para estruturar o conteúdo e gerenciar a API do backend.

---

## 📝 Resumo Rápido para o Dia a Dia

Para os próximos dias de desenvolvimento (assumindo que as dependências já estão instaladas):

```bash
cd arquivo-do-bem-strapi
# 1. Inicia os containers do banco de dados que já foram criados anteriormente
docker-compose start 

# 2. Inicia o servidor do Strapi
npm run develop
```

**Atenção:** Mantenha esta aba do terminal aberta e rodando como base e abra uma nova aba de terminal para iniciar a sua interface frontend!
