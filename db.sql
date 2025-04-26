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
  `nisn` varchar(255) NOT NULL,
  `nama` text,
  `kelas` char(2) DEFAULT NULL,
  `status` int DEFAULT '0',
  `tahunpelajaran` int DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `keterangan` text,
  `untuktanggal` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `absensi` */

insert  into `absensi`(`id`,`nisn`,`nama`,`kelas`,`status`,`tahunpelajaran`,`timestamp`,`keterangan`,`untuktanggal`) values (1,'0123456789','Robah','7A',1,2025,'2025-04-26 17:51:42',NULL,'2025-04-26');

/*Table structure for table `list_siswa` */

CREATE TABLE `list_siswa` (
  `nisn` varchar(255) NOT NULL,
  `nama` text NOT NULL,
  `no_ortu` varchar(255) NOT NULL,
  `no_walas` varchar(255) NOT NULL,
  `kelas` char(2) DEFAULT NULL,
  PRIMARY KEY (`nisn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `list_siswa` */

insert  into `list_siswa`(`nisn`,`nama`,`no_ortu`,`no_walas`,`kelas`) values ('0123456789','Robah','88803833708','488','7A');

/*Table structure for table `pesanwa` */

CREATE TABLE `pesanwa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` int DEFAULT NULL,
  `isi` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `pesanwa` */

insert  into `pesanwa`(`id`,`status`,`isi`) values (1,0,'untuk bolos1'),(2,1,'untuk masuk1'),(3,2,'unutk izin1');

/*Table structure for table `tahunajar` */

CREATE TABLE `tahunajar` (
  `tahun` int NOT NULL,
  PRIMARY KEY (`tahun`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `tahunajar` */

insert  into `tahunajar`(`tahun`) values (2000),(2025);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
