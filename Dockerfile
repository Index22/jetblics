FROM mhart/alpine-node:8

ADD src /src
RUN cd /src ; npm install

EXPOSE 3001

ENTRYPOINT ["node", "/src/index.js"]


