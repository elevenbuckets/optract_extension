FROM nginx

COPY dist/chrome /usr/share/nginx/html
COPY run.sh /bin/run.sh

RUN chmod +x /bin/run.sh

CMD ["/bin/run.sh"]