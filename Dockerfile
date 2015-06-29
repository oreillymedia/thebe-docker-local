FROM ipython/scipystack

MAINTAINER IPython Project <ipython-dev@scipy.org>

# VOLUME /notebooks
# WORKDIR /notebooks

EXPOSE 8888 80

ENV USE_HTTP 1

# RUN apt-get install libfreeimage3

# Need this for add-apt below
RUN apt-get install python-software-properties software-properties-common -y

# Moviepy needs this, but sometimes the ppa isn't found
# RUN add-apt-repository ppa:jon-severinsson/ffmpeg
# RUN apt-get update && apt-get install ffmpeg -y

RUN pip install --upgrade pip
COPY requirements.txt requirements.txt
RUN pip2.7 install -r requirements.txt

RUN pip install ipymd

RUN unset PASSWORD

RUN mkdir images

# gulp
RUN apt-get -y install nodejs

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/

RUN npm install gulp -g

WORKDIR /opt/app
COPY gulpfile.js gulpfile.js
COPY src src
COPY thebe_assets thebe_assets
# ADD images images

# Install nginx.
RUN \
  add-apt-repository -y ppa:nginx/stable && \
  apt-get update && \
  apt-get install -y nginx && \
  rm -rf /var/lib/apt/lists/* && \
  chown -R www-data:www-data /var/lib/nginx

ADD public /var/www/html

ADD start.sh /
RUN chmod u+x /start.sh

CMD ["/start.sh"]
