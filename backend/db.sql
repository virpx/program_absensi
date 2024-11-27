/*
SQLyog Community
MySQL - 8.0.30 : Database - absensi_siswa
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`absensi_siswa` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `absensi_siswa`;

/*Table structure for table `absensi` */

CREATE TABLE `absensi` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nisn` int NOT NULL,
  `nama` text,
  `kelas` int DEFAULT NULL,
  `status` int DEFAULT '0',
  `tahunpelajaran` int DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `keterangan` text,
  `untuktanggal` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `absensi` */

insert  into `absensi`(`id`,`nisn`,`nama`,`kelas`,`status`,`tahunpelajaran`,`timestamp`,`keterangan`,`untuktanggal`) values 
(1,123,'a',NULL,1,NULL,'2024-11-03 00:42:13',NULL,'2024-11-17'),
(2,123,'a',NULL,0,NULL,NULL,NULL,'2024-11-24'),
(3,123,'a',NULL,0,NULL,NULL,NULL,'2024-11-24'),
(4,123,'a',NULL,0,0,NULL,NULL,'2024-11-24'),
(5,124,'b',NULL,0,0,NULL,NULL,'2024-11-24');

/*Table structure for table `list_siswa` */

CREATE TABLE `list_siswa` (
  `nisn` int NOT NULL,
  `nama` text NOT NULL,
  `no_ortu` int NOT NULL,
  `no_walas` int NOT NULL,
  `kelas` int DEFAULT NULL,
  PRIMARY KEY (`nisn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `list_siswa` */

insert  into `list_siswa`(`nisn`,`nama`,`no_ortu`,`no_walas`,`kelas`) values 
(123,'asep',895,8951,9),
(124,'budi',888,81,9);

/*Table structure for table `tahunajar` */

CREATE TABLE `tahunajar` (
  `tahun` int NOT NULL,
  PRIMARY KEY (`tahun`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `tahunajar` */

insert  into `tahunajar`(`tahun`) values 
(2023),
(2024),
(2025),
(2026);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
