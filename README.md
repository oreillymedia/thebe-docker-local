

Dockerized Notebook + SciPy Stack + Nginx
=================================

Originally based on [this](https://github.com/ipython/docker-notebook/tree/master/scipyserver).

## Just Run The Image
Without this cloning down this repo, you can run the image like so:

```bash
docker pull zischwartz/thebe-local-docker:ffmpeg
docker run -d -p 8888:8888 -p 80:80 zischwartz/thebe-local-docker:ffmpeg
```

## Build the Image

```bash
docker build -t zischwartz/thebe-local-docker  .
```

## To Run 

```bash
docker run -d -p 8888:8888 -p 80:80 -v $PWD/public:/var/www/html zischwartz/thebe-local-docker
```

Assuming you're running boot2docker, now you can visit http://192.168.59.103 in your browser.

*Note:* I've been having trouble with the `-v` docker flag for volumes. Powering off  and on boot2docker seems to work it, but is a terrible solution.

## Build htmlbook

```bash
node ~/code/gulp-htmlbook/bin/gulp-htmlbook.js --envPath ~/code/gulp-htmlbook/.env --configPath $PWD/example_content/atlas.json --destination $PWD/public --copyAll
```

Next add the thebe assets

```bash
cp -R thebe_assets/ public/thebe_assets 
chmod -R a+r public
```


## Run Container Interactively & SSH In For Debugging

```bash
docker run  -p 8888:8888 -p 80:80 -i -t --entrypoint /bin/bash zischwartz/thebe-local-docker
```
