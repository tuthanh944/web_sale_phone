# PHÁT TRIỂN ỨNG DỤNG WEB VỚI NODEJS

## Link Video demo:
-   Youtube: https://youtu.be/9d54NP0HosY
-   Drive: https://drive.google.com/drive/folders/1MIEVA99oPlTM4VY4DCLPR0xWjRNHwKRd?usp=sharing

## Công nghệ sử dụng

-   HTML - CSS - JavaScript
-   NodeJS (ExpressJS, Handlebars,...)
-   MongoDB

## Cách chạy source code

-   Bước 1: Tải [Docker Desktop](https://www.docker.com/products/docker-desktop/).
-   Bước 2: Build Docker Image từ Dockerfile

```
docker build -t nodejs-final-project:1.0 .
```

-   Bước 3: Run Docker Container

```
docker run --name nodejs-final-project -d -p 8000:8000 nodejs-final-project:1.0
```

-   Bước 4: Truy cập vào đường link localhost để sử dụng Web ở đường địa chỉ `http://localhost:8000/`

---

## Các thông tin cần thiết:
### Admin:
- username: admin
- password: admin

### Nhân viên bán hàng (salesperson):
- username: user1
- password: user1

### Connection String Database: mongodb+srv://iFoneX:H1NDFoMr5H4JTJIl@cluster0.qctvr61.mongodb.net/iFoneX?retryWrites=true&w=majority

### Setup database:
- Database đã được setup sẵn trên MongoDB Atlas (Cloud Database) 
- Ứng dụng kết nối với database thông qua connection string ở trên
