# Post-Deploy Checklist for Web Services 

---
# Tiếng Việt

## Triển khai (Deploy)

* [ ] CD của GitHub Actions chạy bình thường
* [ ] Code triển khai trên server là phiên bản mới nhất
* [ ] Dịch vụ khởi động sau khi triển khai

## Hoạt động cơ bản

* [ ] Các chức năng chính sử dụng không vấn đề

## Dữ liệu / Lưu trữ

* [ ] Chức năng tải file hoạt động bình thường (nếu có)
* [ ] File đã tải lên được lưu đúng

## Liên kết bên ngoài / Hệ thống khác

* [ ] Liên kết bên ngoài thực hiện bình thường
* [ ] Chức năng sử dụng instance khác (vd: tạo ca làm việc) hoạt động không vấn đề

## Cài đặt môi trường

* [ ] Biến môi trường / Secret được cài đặt đúng
* [ ] Kết nối DB bình thường

## Bảo mật

* [ ] Không tồn tại tài khoản quản trị có mật khẩu đơn giản
* [ ] **S3 bucket không cho phép truy cập Public**

## Cài đặt khởi động

* [ ] Đã cấu hình để dịch vụ tự động khởi động khi server khởi động lại

## Mạng / API

* [ ] API được gọi bình thường từ frontend

## Batch / Scheduler

* [ ] cron / scheduler / worker đang chạy (nếu có)

---

# English

## Deploy

* [ ] GitHub Actions CD runs successfully
* [ ] Code deployed on the server is the latest
* [ ] Service is running after deployment

## Basic operation

* [ ] Major features work without issues

## Data / Storage

* [ ] File upload works correctly (if applicable)
* [ ] Uploaded files are stored correctly

## External integration / Other systems

* [ ] External integration works correctly
* [ ] Features using other instances (e.g. shift generation) work without issues

## Environment configuration

* [ ] Environment variables / Secrets are set correctly
* [ ] DB connection is working

## Security

* [ ] No admin accounts with weak passwords exist
* [ ] **S3 bucket does not allow public access**

## Startup configuration

* [ ] Service is configured to start automatically on server reboot

## Network / API

* [ ] API is called successfully from the frontend

## Batch / Scheduler

* [ ] cron / scheduler / worker is running (if applicable)

---

# 日本語

## デプロイ

* [ ] GitHub Actions の CD が正常に実行される
* [ ] サーバーにデプロイされているコードが最新である
* [ ] デプロイ後サービスが起動している

## 基本動作

* [ ] 主要機能が問題なく使える

## データ / ストレージ

* [ ] ファイルアップロード機能が正常動作する（ある場合）
* [ ] アップロードしたファイルが正しく保存されている

## 外部連携 / 他システム

* [ ] 外部連携が正常に行える
* [ ] 他インスタンス（例：シフト生成など）を利用する機能が問題なく使える

## 環境設定

* [ ] 環境変数 / Secret が正しく設定されている
* [ ] DB接続が正常

## セキュリティ

* [ ] 簡単なパスワードの管理者アカウントが存在しない
* [ ] **S3バケットがPublicアクセス不可になっている**

## 起動設定

* [ ] サーバー再起動時もサービスが自動開始できるように設定されている

## ネットワーク / API

* [ ] フロントエンドからAPIが正常に呼び出せる

## バッチ / スケジューラ

* [ ] cron / scheduler / worker が起動している（ある場合）
