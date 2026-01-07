// 실제 학생 데이터 (267명)
// 1학년: 121명 (4층 4A, 4B, 4C, 4D)
// 2학년: 146명 (3층 3A, 3B, 3C, 3D)

import { SEAT_LAYOUTS } from './seatLayouts'
import { PRE_ABSENCES } from './preAbsences'

export interface Student {
  studentId: string  // 5자리 학번
  name: string
  seatId: string
  residenceType: 'commute' | 'dormitory'  // 통학 | 기숙
  preAbsence?: {
    reason: string
    startDate: string
    endDate: string
  }
}

// 1학년 학생 목록 (121명) - 확정 좌석배치
type ResidenceType = 'commute' | 'dormitory'
const GRADE1_STUDENTS: { studentId: string; name: string; seatId: string; residenceType: ResidenceType }[] = [
  { studentId: '10101', name: '강민재', seatId: '4D028', residenceType: 'commute' },
  { studentId: '10102', name: '권민준', seatId: '4D045', residenceType: 'commute' },
  { studentId: '10103', name: '길윤석', seatId: '4D120', residenceType: 'dormitory' },
  { studentId: '10105', name: '김동훈', seatId: '4D047', residenceType: 'commute' },
  { studentId: '10109', name: '김재현', seatId: '4D034', residenceType: 'commute' },
  { studentId: '10112', name: '김진경', seatId: '4A032', residenceType: 'commute' },
  { studentId: '10114', name: '김희현', seatId: '4A067', residenceType: 'commute' },
  { studentId: '10117', name: '심초이', seatId: '4A028', residenceType: 'commute' },
  { studentId: '10118', name: '우소윤', seatId: '4A045', residenceType: 'commute' },
  { studentId: '10123', name: '이시호', seatId: '4D049', residenceType: 'commute' },
  { studentId: '10125', name: '이지후', seatId: '4D100', residenceType: 'dormitory' },
  { studentId: '10130', name: '정지희', seatId: '4A118', residenceType: 'dormitory' },
  { studentId: '10201', name: '강수경', seatId: '4A018', residenceType: 'commute' },
  { studentId: '10204', name: '김서이', seatId: '4A056', residenceType: 'commute' },
  { studentId: '10206', name: '김세아', seatId: '4A013', residenceType: 'commute' },
  { studentId: '10209', name: '김은정', seatId: '4A109', residenceType: 'dormitory' },
  { studentId: '10210', name: '김준연', seatId: '4D109', residenceType: 'dormitory' },
  { studentId: '10212', name: '박서현', seatId: '4A070', residenceType: 'commute' },
  { studentId: '10225', name: '이재호', seatId: '4D118', residenceType: 'dormitory' },
  { studentId: '10227', name: '이혜윰', seatId: '4A120', residenceType: 'dormitory' },
  { studentId: '10229', name: '정지유', seatId: '4A116', residenceType: 'dormitory' },
  { studentId: '10230', name: '황근서', seatId: '4A099', residenceType: 'dormitory' },
  { studentId: '10231', name: '황보상림', seatId: '4D117', residenceType: 'dormitory' },
  { studentId: '10306', name: '김지윤', seatId: '4A061', residenceType: 'commute' },
  { studentId: '10310', name: '박시원', seatId: '4A048', residenceType: 'commute' },
  { studentId: '10316', name: '이보미', seatId: '4A131', residenceType: 'dormitory' },
  { studentId: '10318', name: '이수린', seatId: '4A088', residenceType: 'dormitory' },
  { studentId: '10320', name: '이용준', seatId: '4D080', residenceType: 'dormitory' },
  { studentId: '10322', name: '이지호', seatId: '4A107', residenceType: 'dormitory' },
  { studentId: '10330', name: '최은영', seatId: '4A141', residenceType: 'dormitory' },
  { studentId: '10331', name: '최지윤', seatId: '4A146', residenceType: 'dormitory' },
  { studentId: '10332', name: '홍석영', seatId: '4D115', residenceType: 'dormitory' },
  { studentId: '10401', name: '강경빈', seatId: '4D098', residenceType: 'dormitory' },
  { studentId: '10402', name: '곽수진', seatId: '4A098', residenceType: 'dormitory' },
  { studentId: '10403', name: '김민서', seatId: '4A058', residenceType: 'commute' },
  { studentId: '10406', name: '김수찬', seatId: '4D032', residenceType: 'commute' },
  { studentId: '10409', name: '박신영', seatId: '4A069', residenceType: 'commute' },
  { studentId: '10411', name: '박현준', seatId: '4D114', residenceType: 'dormitory' },
  { studentId: '10413', name: '서정우', seatId: '4D030', residenceType: 'commute' },
  { studentId: '10414', name: '송재연', seatId: '4A125', residenceType: 'dormitory' },
  { studentId: '10418', name: '심미주', seatId: '4A142', residenceType: 'dormitory' },
  { studentId: '10421', name: '이민준', seatId: '4D027', residenceType: 'commute' },
  { studentId: '10422', name: '이소민', seatId: '4A132', residenceType: 'dormitory' },
  { studentId: '10427', name: '장윤서', seatId: '4A016', residenceType: 'commute' },
  { studentId: '10430', name: '천보경', seatId: '4A136', residenceType: 'dormitory' },
  { studentId: '10505', name: '김도윤', seatId: '4A020', residenceType: 'commute' },
  { studentId: '10507', name: '김민호', seatId: '4D107', residenceType: 'dormitory' },
  { studentId: '10523', name: '연정원', seatId: '4D038', residenceType: 'commute' },
  { studentId: '10526', name: '이도경', seatId: '4D089', residenceType: 'dormitory' },
  { studentId: '10528', name: '이채은', seatId: '4A139', residenceType: 'dormitory' },
  { studentId: '10602', name: '공효정', seatId: '4A087', residenceType: 'dormitory' },
  { studentId: '10608', name: '남윤아', seatId: '4A129', residenceType: 'dormitory' },
  { studentId: '10610', name: '변성민', seatId: '4D072', residenceType: 'dormitory' },
  { studentId: '10611', name: '신예서', seatId: '4A137', residenceType: 'dormitory' },
  { studentId: '10617', name: '윤정환', seatId: '4D102', residenceType: 'dormitory' },
  { studentId: '10621', name: '이효민', seatId: '4D112', residenceType: 'dormitory' },
  { studentId: '10627', name: '채민서', seatId: '4A015', residenceType: 'commute' },
  { studentId: '10717', name: '송주성', seatId: '4D081', residenceType: 'dormitory' },
  { studentId: '10719', name: '유가은', seatId: '4A114', residenceType: 'dormitory' },
  { studentId: '10723', name: '이승현', seatId: '4D052', residenceType: 'commute' },
  { studentId: '10724', name: '이율하', seatId: '4A065', residenceType: 'commute' },
  { studentId: '10725', name: '임선우', seatId: '4D110', residenceType: 'dormitory' },
  { studentId: '10730', name: '차유근', seatId: '4D106', residenceType: 'dormitory' },
  { studentId: '10731', name: '최수연', seatId: '4A085', residenceType: 'dormitory' },
  { studentId: '10801', name: '강연서', seatId: '4A096', residenceType: 'dormitory' },
  { studentId: '10802', name: '고민주', seatId: '4A074', residenceType: 'commute' },
  { studentId: '10804', name: '김건', seatId: '4D096', residenceType: 'dormitory' },
  { studentId: '10806', name: '김도훈', seatId: '4D095', residenceType: 'dormitory' },
  { studentId: '10807', name: '김민재', seatId: '4D091', residenceType: 'dormitory' },
  { studentId: '10808', name: '김민정', seatId: '4A110', residenceType: 'dormitory' },
  { studentId: '10810', name: '김유현', seatId: '4A095', residenceType: 'dormitory' },
  { studentId: '10812', name: '김효린', seatId: '4A052', residenceType: 'commute' },
  { studentId: '10819', name: '장서인', seatId: '4A043', residenceType: 'commute' },
  { studentId: '10821', name: '정지후', seatId: '4D054', residenceType: 'commute' },
  { studentId: '10822', name: '정채은', seatId: '4A072', residenceType: 'commute' },
  { studentId: '10830', name: '황예원', seatId: '4A041', residenceType: 'commute' },
  { studentId: '10831', name: '황인성', seatId: '4D061', residenceType: 'dormitory' },
  { studentId: '10902', name: '구현영', seatId: '4D067', residenceType: 'dormitory' },
  { studentId: '10904', name: '김나현', seatId: '4A039', residenceType: 'commute' },
  { studentId: '10905', name: '김도연', seatId: '4A026', residenceType: 'commute' },
  { studentId: '10907', name: '김소은', seatId: '4A050', residenceType: 'commute' },
  { studentId: '10910', name: '김유경', seatId: '4A127', residenceType: 'dormitory' },
  { studentId: '10911', name: '김지몽', seatId: '4D036', residenceType: 'commute' },
  { studentId: '10913', name: '류재석', seatId: '4D065', residenceType: 'dormitory' },
  { studentId: '10921', name: '이동현', seatId: '4D041', residenceType: 'commute' },
  { studentId: '10923', name: '임예준', seatId: '4D063', residenceType: 'dormitory' },
  { studentId: '10928', name: '채희서', seatId: '4D043', residenceType: 'commute' },
  { studentId: '10930', name: '홍서우', seatId: '4A054', residenceType: 'commute' },
  { studentId: '11009', name: '박수진', seatId: '4A023', residenceType: 'commute' },
  { studentId: '11018', name: '신유경', seatId: '4A093', residenceType: 'dormitory' },
  { studentId: '11027', name: '임예지', seatId: '4A144', residenceType: 'dormitory' },
  { studentId: '11028', name: '조경준', seatId: '4D104', residenceType: 'dormitory' },
  { studentId: '11103', name: '권하음', seatId: '4A123', residenceType: 'dormitory' },
  { studentId: '11105', name: '김시은', seatId: '4A112', residenceType: 'dormitory' },
  { studentId: '11108', name: '김의진', seatId: '4D076', residenceType: 'dormitory' },
  { studentId: '11111', name: '배현우', seatId: '4D059', residenceType: 'dormitory' },
  { studentId: '11115', name: '안서연', seatId: '4A030', residenceType: 'commute' },
  { studentId: '11117', name: '왕영서', seatId: '4A047', residenceType: 'commute' },
  { studentId: '11122', name: '이채원', seatId: '4A025', residenceType: 'commute' },
  // { studentId: '11125', name: '전서희', seatId: '4A036' } - 제거됨 (2026-01-07)
  { studentId: '11201', name: '강빛나', seatId: '4A121', residenceType: 'dormitory' },
  { studentId: '11202', name: '강서진', seatId: '4D087', residenceType: 'dormitory' },
  { studentId: '11203', name: '강태준', seatId: '4D084', residenceType: 'dormitory' },
  { studentId: '11204', name: '김나래', seatId: '4A103', residenceType: 'dormitory' },
  { studentId: '11206', name: '노하윤', seatId: '4A063', residenceType: 'commute' },
  { studentId: '11209', name: '박소윤', seatId: '4A101', residenceType: 'dormitory' },
  { studentId: '11210', name: '박소윤', seatId: '4A105', residenceType: 'dormitory' },
  { studentId: '11212', name: '박준범', seatId: '4D075', residenceType: 'dormitory' },
  { studentId: '11214', name: '신금비', seatId: '4A059', residenceType: 'commute' },
  { studentId: '11215', name: '신민영', seatId: '4D082', residenceType: 'dormitory' },
  { studentId: '11216', name: '신민정', seatId: '4A037', residenceType: 'commute' },
  { studentId: '11217', name: '양민혁', seatId: '4D069', residenceType: 'dormitory' },
  { studentId: '11218', name: '예진희', seatId: '4D057', residenceType: 'dormitory' },
  { studentId: '11219', name: '이동휘', seatId: '4D078', residenceType: 'dormitory' },
  { studentId: '11221', name: '이승채', seatId: '4A134', residenceType: 'dormitory' },
  { studentId: '11222', name: '이은채', seatId: '4A034', residenceType: 'commute' },
  { studentId: '11223', name: '이태헌', seatId: '4D093', residenceType: 'dormitory' },
  { studentId: '11227', name: '최정후', seatId: '4D085', residenceType: 'dormitory' },
  { studentId: '11228', name: '한정원', seatId: '4D056', residenceType: 'commute' },
  { studentId: '11230', name: '허민영', seatId: '4A090', residenceType: 'dormitory' },
  { studentId: '11231', name: '허재원', seatId: '4D073', residenceType: 'dormitory' },
  { studentId: '11232', name: '허지윤', seatId: '4A092', residenceType: 'dormitory' },
]

// 2학년 학생 목록 (확정 좌석배치 - 최종)
const GRADE2_STUDENTS: { studentId: string; name: string; seatId: string; residenceType: ResidenceType }[] = [
  { studentId: '20104', name: '김민서', seatId: '3D091', residenceType: 'dormitory' },
  { studentId: '20105', name: '김성윤', seatId: '3D055', residenceType: 'commute' },
  { studentId: '20109', name: '김지은', seatId: '3D092', residenceType: 'dormitory' },
  { studentId: '20111', name: '박서현', seatId: '3D101', residenceType: 'commute' },
  { studentId: '20116', name: '양우빈', seatId: '3A116', residenceType: 'dormitory' },
  { studentId: '20122', name: '이재원', seatId: '3D093', residenceType: 'dormitory' },
  { studentId: '20123', name: '이현진', seatId: '3B082', residenceType: 'commute' },
  { studentId: '20126', name: '정여원', seatId: '3B092', residenceType: 'dormitory' },
  { studentId: '20128', name: '조정연', seatId: '3A027', residenceType: 'dormitory' },
  { studentId: '20202', name: '김나연', seatId: '3A066', residenceType: 'dormitory' },
  { studentId: '20206', name: '김효민', seatId: '3D013', residenceType: 'dormitory' },
  { studentId: '20208', name: '박동현', seatId: '3D014', residenceType: 'dormitory' },
  { studentId: '20212', name: '석재언', seatId: '3D094', residenceType: 'dormitory' },
  { studentId: '20214', name: '오민하', seatId: '3D096', residenceType: 'dormitory' },
  { studentId: '20215', name: '오영재', seatId: '3D097', residenceType: 'dormitory' },
  { studentId: '20221', name: '이주원', seatId: '3B080', residenceType: 'dormitory' },
  { studentId: '20224', name: '이현준', seatId: '3D001', residenceType: 'commute' },
  { studentId: '20229', name: '최서윤', seatId: '3D098', residenceType: 'dormitory' },
  { studentId: '20303', name: '권상윤', seatId: '3B078', residenceType: 'dormitory' },
  { studentId: '20305', name: '김다연', seatId: '3A064', residenceType: 'dormitory' },
  { studentId: '20308', name: '김민우', seatId: '3B077', residenceType: 'dormitory' },
  { studentId: '20310', name: '김서진', seatId: '3D102', residenceType: 'dormitory' },
  { studentId: '20314', name: '박준용', seatId: '3D015', residenceType: 'dormitory' },
  { studentId: '20317', name: '안예나', seatId: '3D103', residenceType: 'dormitory' },
  { studentId: '20319', name: '유혜원', seatId: '3D099', residenceType: 'dormitory' },
  { studentId: '20324', name: '전지영', seatId: '3D100', residenceType: 'dormitory' },
  { studentId: '20326', name: '주서연', seatId: '3A051', residenceType: 'dormitory' },
  { studentId: '20328', name: '최재영', seatId: '3D002', residenceType: 'commute' },
  { studentId: '20329', name: '최현민', seatId: '3D120', residenceType: 'commute' },
  { studentId: '20401', name: '강동우', seatId: '3D003', residenceType: 'dormitory' },
  { studentId: '20404', name: '김동완', seatId: '3B075', residenceType: 'commute' },
  { studentId: '20406', name: '김지후', seatId: '3D004', residenceType: 'dormitory' },
  { studentId: '20407', name: '김효원', seatId: '3A119', residenceType: 'dormitory' },
  { studentId: '20411', name: '박예진', seatId: '3A048', residenceType: 'dormitory' },
  { studentId: '20412', name: '박지원', seatId: '3D061', residenceType: 'dormitory' },
  { studentId: '20414', name: '송예나', seatId: '3D121', residenceType: 'commute' },
  { studentId: '20417', name: '양은준', seatId: '3B073', residenceType: 'dormitory' },
  { studentId: '20422', name: '이승윤', seatId: '3D059', residenceType: 'commute' },
  { studentId: '20424', name: '이효찬', seatId: '3D016', residenceType: 'dormitory' },
  { studentId: '20428', name: '정채은', seatId: '3D104', residenceType: 'dormitory' },
  { studentId: '20501', name: '강리안', seatId: '3D062', residenceType: 'dormitory' },
  { studentId: '20506', name: '김시현', seatId: '3D028', residenceType: 'commute' },
  { studentId: '20511', name: '박태현', seatId: '3D017', residenceType: 'commute' },
  { studentId: '20512', name: '배성훈', seatId: '3A121', residenceType: 'commute' },
  { studentId: '20514', name: '복준서', seatId: '3B042', residenceType: 'dormitory' },
  { studentId: '20517', name: '신유준', seatId: '3D018', residenceType: 'dormitory' },
  { studentId: '20520', name: '염우진', seatId: '3D005', residenceType: 'dormitory' },
  { studentId: '20521', name: '오우진', seatId: '3D019', residenceType: 'dormitory' },
  { studentId: '20523', name: '이보람', seatId: '3D063', residenceType: 'dormitory' },
  { studentId: '20525', name: '이준호', seatId: '3D040', residenceType: 'commute' },
  { studentId: '20527', name: '이한율', seatId: '3D020', residenceType: 'dormitory' },
  { studentId: '20531', name: '황성주', seatId: '3D021', residenceType: 'dormitory' },
  { studentId: '20602', name: '권서진', seatId: '3B040', residenceType: 'dormitory' },
  { studentId: '20607', name: '김채영', seatId: '3D064', residenceType: 'dormitory' },
  { studentId: '20610', name: '민승빈', seatId: '3D065', residenceType: 'commute' },
  { studentId: '20611', name: '박서진', seatId: '3D066', residenceType: 'dormitory' },
  { studentId: '20612', name: '신승훈', seatId: '3A123', residenceType: 'commute' },
  { studentId: '20613', name: '신찬식', seatId: '3B038', residenceType: 'dormitory' },
  { studentId: '20616', name: '오윤석', seatId: '3D022', residenceType: 'dormitory' },
  { studentId: '20618', name: '오준혁', seatId: '3D023', residenceType: 'dormitory' },
  { studentId: '20619', name: '이윤경', seatId: '3D105', residenceType: 'commute' },
  { studentId: '20623', name: '이하윤', seatId: '3D106', residenceType: 'dormitory' },
  { studentId: '20624', name: '임진섭', seatId: '3D024', residenceType: 'dormitory' },
  { studentId: '20630', name: '하정원', seatId: '3D006', residenceType: 'dormitory' },
  { studentId: '20701', name: '강민주', seatId: '3D067', residenceType: 'dormitory' },
  { studentId: '20703', name: '김민채', seatId: '3D068', residenceType: 'dormitory' },
  { studentId: '20711', name: '노담결', seatId: '3D025', residenceType: 'dormitory' },
  { studentId: '20712', name: '문주혁', seatId: '3D007', residenceType: 'dormitory' },
  { studentId: '20722', name: '이지운', seatId: '3D026', residenceType: 'dormitory' },
  { studentId: '20723', name: '이진후', seatId: '3D008', residenceType: 'commute' },
  { studentId: '20726', name: '임은혁', seatId: '3D009', residenceType: 'commute' },
  { studentId: '20802', name: '권시우', seatId: '3D069', residenceType: 'dormitory' },
  { studentId: '20803', name: '김민서', seatId: '3B090', residenceType: 'dormitory' },
  { studentId: '20807', name: '나현빈', seatId: '3D041', residenceType: 'dormitory' },
  { studentId: '20808', name: '박예준', seatId: '3B088', residenceType: 'dormitory' },
  { studentId: '20816', name: '이서윤', seatId: '3D070', residenceType: 'dormitory' },
  { studentId: '20823', name: '장석현', seatId: '3D029', residenceType: 'commute' },
  { studentId: '20826', name: '정지인', seatId: '3D071', residenceType: 'dormitory' },
  { studentId: '20827', name: '진호윤', seatId: '3B050', residenceType: 'dormitory' },
  { studentId: '20829', name: '홍은석', seatId: '3D030', residenceType: 'dormitory' },
  { studentId: '20906', name: '김아름', seatId: '3D072', residenceType: 'dormitory' },
  { studentId: '20907', name: '김은결', seatId: '3D031', residenceType: 'dormitory' },
  { studentId: '20909', name: '김하을', seatId: '3D113', residenceType: 'commute' },
  { studentId: '20912', name: '박준희', seatId: '3D073', residenceType: 'dormitory' },
  { studentId: '20916', name: '오한별', seatId: '3D107', residenceType: 'dormitory' },
  { studentId: '20920', name: '이예은', seatId: '3D074', residenceType: 'dormitory' },
  { studentId: '20922', name: '이호연', seatId: '3D108', residenceType: 'dormitory' },
  { studentId: '20923', name: '이훈', seatId: '3D042', residenceType: 'commute' },
  { studentId: '20924', name: '장예진', seatId: '3D075', residenceType: 'dormitory' },
  { studentId: '20926', name: '정서은', seatId: '3D076', residenceType: 'dormitory' },
  { studentId: '20927', name: '조아영', seatId: '3D109', residenceType: 'dormitory' },
  { studentId: '20929', name: '조현우', seatId: '3D010', residenceType: 'dormitory' },
  { studentId: '20931', name: '최유빈', seatId: '3D077', residenceType: 'dormitory' },
  { studentId: '20932', name: '최혜선', seatId: '3D078', residenceType: 'dormitory' },
  { studentId: '20933', name: '한지은', seatId: '3D079', residenceType: 'dormitory' },
  { studentId: '21002', name: '김동오', seatId: '3B037', residenceType: 'dormitory' },
  { studentId: '21005', name: '김지유', seatId: '3D080', residenceType: 'commute' },
  { studentId: '21006', name: '김찬결', seatId: '3A125', residenceType: 'dormitory' },
  { studentId: '21009', name: '박린', seatId: '3D081', residenceType: 'dormitory' },
  { studentId: '21010', name: '박서준', seatId: '3D011', residenceType: 'dormitory' },
  { studentId: '21012', name: '서유진', seatId: '3D110', residenceType: 'dormitory' },
  { studentId: '21019', name: '윤연서', seatId: '3B048', residenceType: 'commute' },
  { studentId: '21020', name: '이시현', seatId: '3D111', residenceType: 'dormitory' },
  { studentId: '21022', name: '이은채', seatId: '3D112', residenceType: 'dormitory' },
  { studentId: '21023', name: '이지민', seatId: '3D082', residenceType: 'dormitory' },
  { studentId: '21025', name: '임현섭', seatId: '3D032', residenceType: 'dormitory' },
  { studentId: '21026', name: '정유진', seatId: '3D083', residenceType: 'dormitory' },
  { studentId: '21029', name: '하은호', seatId: '3B052', residenceType: 'dormitory' },
  { studentId: '21103', name: '김서율', seatId: '3D084', residenceType: 'dormitory' },
  { studentId: '21106', name: '김지수', seatId: '3D058', residenceType: 'commute' },
  { studentId: '21107', name: '김지원', seatId: '3D085', residenceType: 'dormitory' },
  { studentId: '21108', name: '김지인', seatId: '3D086', residenceType: 'dormitory' },
  { studentId: '21115', name: '신정인', seatId: '3D114', residenceType: 'dormitory' },
  { studentId: '21116', name: '심예린', seatId: '3D087', residenceType: 'commute' },
  { studentId: '21117', name: '심지윤', seatId: '3D033', residenceType: 'dormitory' },
  { studentId: '21118', name: '안수진', seatId: '3D088', residenceType: 'dormitory' },
  { studentId: '21120', name: '유혜림', seatId: '3D089', residenceType: 'dormitory' },
  { studentId: '21124', name: '임진휘', seatId: '3D115', residenceType: 'dormitory' },
  { studentId: '21125', name: '장윤실', seatId: '3D057', residenceType: 'commute' },
  { studentId: '21128', name: '정은서', seatId: '3A046', residenceType: 'dormitory' },
  { studentId: '21129', name: '정태양', seatId: '3D034', residenceType: 'dormitory' },
  { studentId: '21130', name: '추예나', seatId: '3D116', residenceType: 'commute' },
  { studentId: '21201', name: '구나예', seatId: '3D060', residenceType: 'commute' },
  { studentId: '21202', name: '김민서', seatId: '3A033', residenceType: 'dormitory' },
  { studentId: '21203', name: '김민준', seatId: '3A127', residenceType: 'dormitory' },
  { studentId: '21204', name: '김승현', seatId: '3D035', residenceType: 'dormitory' },
  { studentId: '21205', name: '김채영', seatId: '3D117', residenceType: 'dormitory' },
  { studentId: '21206', name: '박재범', seatId: '3D036', residenceType: 'commute' },
  { studentId: '21207', name: '반가은', seatId: '3A141', residenceType: 'dormitory' },
  { studentId: '21208', name: '손예담', seatId: '3A069', residenceType: 'dormitory' },
  { studentId: '21209', name: '손지윤', seatId: '3D118', residenceType: 'dormitory' },
  { studentId: '21210', name: '신성윤', seatId: '3D012', residenceType: 'dormitory' },
  { studentId: '21211', name: '양우혁', seatId: '3D037', residenceType: 'dormitory' },
  { studentId: '21212', name: '오윤서', seatId: '3A130', residenceType: 'commute' },
  { studentId: '21213', name: '윤지산', seatId: '3D056', residenceType: 'commute' },
  { studentId: '21214', name: '이재훈', seatId: '3D038', residenceType: 'commute' },
  { studentId: '21215', name: '이정우', seatId: '3D039', residenceType: 'dormitory' },
  { studentId: '21216', name: '정성주', seatId: '3A132', residenceType: 'dormitory' },
  { studentId: '21217', name: '정현지', seatId: '3D119', residenceType: 'dormitory' },
  { studentId: '21218', name: '조윤서', seatId: '3A134', residenceType: 'dormitory' },
  { studentId: '21219', name: '최담이', seatId: '3D095', residenceType: 'dormitory' },
  { studentId: '21220', name: '최진성', seatId: '3A129', residenceType: 'commute' },
  { studentId: '21221', name: '한서정', seatId: '3D090', residenceType: 'commute' },
  { studentId: '21222', name: '허윤서', seatId: '3A136', residenceType: 'dormitory' },
  { studentId: '21223', name: '홍서은', seatId: '3A138', residenceType: 'dormitory' },
  { studentId: '21224', name: '홍예빈', seatId: '3A139', residenceType: 'commute' },
]

// 구역에서 모든 좌석 ID 추출 (숫자 순으로 정렬)
function getAllSeatIds(zoneId: string): string[] {
  const layout = SEAT_LAYOUTS[zoneId]
  if (!layout) return []

  const seatIds: string[] = []
  layout.forEach(row => {
    if (row[0] === 'br') return
    row.forEach(cell => {
      if (cell !== 'sp' && cell !== 'empty' && cell !== 'br') {
        seatIds.push(cell as string)
      }
    })
  })

  // 좌석 번호 순으로 정렬 (4A001, 4A002, ...)
  return seatIds.sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''))
    const numB = parseInt(b.replace(/\D/g, ''))
    return numA - numB
  })
}

// 학생을 좌석에 배치 (미배치 좌석은 null)
function assignStudentsToSeats(): Map<string, Student | null> {
  const studentMap = new Map<string, Student | null>()

  // 모든 구역의 좌석을 먼저 null로 초기화
  const allZones = ['4A', '4B', '4C', '4D', '3A', '3B', '3C', '3D', 'C407', 'C409', 'C306', 'C307', 'C309']
  allZones.forEach((zoneId) => {
    const seatIds = getAllSeatIds(zoneId)
    seatIds.forEach((seatId) => {
      studentMap.set(seatId, null)
    })
  })

  // 1학년 학생 배치 (확정된 좌석 사용)
  GRADE1_STUDENTS.forEach((studentData) => {
    const preAbsence = PRE_ABSENCES[studentData.studentId]
    studentMap.set(studentData.seatId, {
      studentId: studentData.studentId,
      name: studentData.name,
      seatId: studentData.seatId,
      residenceType: studentData.residenceType,
      ...(preAbsence && { preAbsence }),
    })
  })

  // 2학년 학생 배치 (확정된 좌석 사용)
  GRADE2_STUDENTS.forEach((studentData) => {
    const preAbsence = PRE_ABSENCES[studentData.studentId]
    studentMap.set(studentData.seatId, {
      studentId: studentData.studentId,
      name: studentData.name,
      seatId: studentData.seatId,
      residenceType: studentData.residenceType,
      ...(preAbsence && { preAbsence }),
    })
  })

  return studentMap
}

// 학생 데이터 (고정)
export const STUDENTS = assignStudentsToSeats()

// 좌석 ID로 학생 찾기 (null이면 미배치)
export function getStudentBySeatId(seatId: string): Student | null {
  return STUDENTS.get(seatId) ?? null
}

// 학생 이름으로 검색
export interface StudentSearchResult {
  student: Student
  zoneId: string
  zoneName: string
}

const ZONE_NAMES: Record<string, string> = {
  '4A': '4층 A구역',
  '4B': '4층 B구역',
  '4C': '4층 C구역',
  '4D': '4층 D구역',
  '3A': '3층 A구역',
  '3B': '3층 B구역',
  '3C': '3층 C구역',
  '3D': '3층 D구역',
  'C407': 'C407',
  'C409': 'C409',
  'C306': 'C306',
  'C307': 'C307',
  'C309': 'C309',
}

export function searchStudentByName(name: string): StudentSearchResult[] {
  const results: StudentSearchResult[] = []

  STUDENTS.forEach((student, seatId) => {
    if (student && student.name.includes(name)) {
      const zoneId = seatId.match(/^[34][A-D]|C\d{3}/)?.[0] || ''
      results.push({
        student,
        zoneId,
        zoneName: ZONE_NAMES[zoneId] || zoneId,
      })
    }
  })

  return results
}

// 학번으로 학생 찾기
export function getStudentByStudentId(studentId: string): Student | null {
  for (const student of STUDENTS.values()) {
    if (student && student.studentId === studentId) {
      return student
    }
  }
  return null
}

// 구역별 배정된 학생 수 반환
export function getStudentCountByZone(zoneId: string): number {
  const seatIds = getAllSeatIds(zoneId)
  let count = 0
  seatIds.forEach((seatId) => {
    if (STUDENTS.get(seatId)) count++
  })
  return count
}

// 전체 학생 목록 (배정된 학생만)
export function getAllStudents(): Student[] {
  const students: Student[] = []
  STUDENTS.forEach((student) => {
    if (student) students.push(student)
  })
  return students
}

// 학년별 학생 목록
export function getStudentsByGrade(grade: 1 | 2): Student[] {
  const prefix = grade === 1 ? '4' : '3'
  const students: Student[] = []
  STUDENTS.forEach((student, seatId) => {
    if (student && seatId.startsWith(prefix)) {
      students.push(student)
    }
  })
  return students
}

// MockStudent 타입 호환성을 위한 alias
export type MockStudent = Student
export const MOCK_STUDENTS = STUDENTS
