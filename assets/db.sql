CREATE DATABASE `absensi_siswa`;
USE `absensi_siswa`;
CREATE TABLE `absensi` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nisn` varchar(255) NOT NULL,
  `nama` text,
  `kelas` char(2) DEFAULT NULL,
  `status` int DEFAULT '0',
  `tahunpelajaran` int DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `keterangan` text,
  `untuktanggal` date DEFAULT NULL,
  PRIMARY KEY (`id`)
);
CREATE TABLE `list_siswa` (
  `nisn` varchar(255) NOT NULL,
  `nama` text NOT NULL,
  `no_ortu` varchar(255) NOT NULL,
  `no_walas` varchar(255) NOT NULL,
  `kelas` char(2) DEFAULT NULL,
  PRIMARY KEY (`nisn`)
);
CREATE TABLE `tahunajar` (
  `tahun` int NOT NULL,
  PRIMARY KEY (`tahun`)
);
