# Dockerfile
# Use an official Node.js runtime as the base image
FROM node:22.1.0
USER root

RUN apt-get update \
    && npm install -g pnpm

USER 1000
WORKDIR /usr/src/app
# Copy package.json and package-lock.json to the container
COPY --chown=1000 package.json package-lock.json pnpm-lock.yaml ./

# Copy the rest of the application files to the container
COPY --chown=1000 . .

RUN rm -rf node_modules .next .next-env.d.ts \
    && pnpm install \
    && pnpm build

# Expose the application port (assuming your app runs on port 3000)
EXPOSE 5001

# Start the application
CMD ["pnpm", "start"]
