# Node 22 to match the GitHub Pages workflow (.github/workflows/deploy.yml)
FROM node:22-bookworm

# Tools you'll want inside the container (git is needed by VS Code's source control)
RUN apt-get update \
    && apt-get install -y --no-install-recommends git less sudo \
    && rm -rf /var/lib/apt/lists/* \
    && echo "node ALL=(root) NOPASSWD:ALL" > /etc/sudoers.d/node \
    && chmod 0440 /etc/sudoers.d/node

# Same pnpm version as package.json devEngines and CI
RUN npm install -g pnpm@11.9.0

# The base image already ships a non-root "node" user (uid 1000), which lines up
# with your WSL user so bind-mounted files keep sane ownership
RUN mkdir -p /workspace/node_modules && chown -R node:node /workspace
USER node
WORKDIR /workspace
