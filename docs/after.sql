CREATE TABLE `t_after_order`
(
  `id` bigint
(20) NOT NULL AUTO_INCREMENT,
  `create_time` int
(11) NOT NULL DEFAULT 0,
  `update_time` int
(11) NOT NULL,
  `status` tinyint
(2) NOT NULL DEFAULT 0 COMMENT '0:申请中1:已完成2:未通过',
  `business_id` bigint
(20) NOT NULL DEFAULT 0,
  `user_id` bigint
(20) NOT NULL DEFAULT 0,
  `order_id` bigint
(20) NOT NULL DEFAULT 0,
  `order_item_id` bigint
(20) NOT NULL DEFAULT 0,
  `goods_id` bigint
(20) NOT NULL,
  `type` tinyint
(1) NOT NULL DEFAULT 0 COMMENT '1退货2:换货',
  `after_no` varchar
(32) CHARACTER
SET utf8mb4
COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '售后单号',
  `reason` varchar
(255) CHARACTER
SET utf8mb4
COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '售后原因',
  `pics` varchar
(1000) CHARACTER
SET utf8mb4
COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `amount` bigint
(20) NOT NULL DEFAULT 0 COMMENT '退款金额',
  PRIMARY KEY
(`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER
SET = utf8mb4
COLLATE = utf8mb4_general_ci ROW_FORMAT = Compact;

ALTER TABLE `t_order_item`
ADD COLUMN `after_status` TINYINT
(1) NOT NULL DEFAULT 0 COMMENT '售后状态,0:未申请1:处理中2:已完结';
ALTER TABLE `t_order_item`
ADD COLUMN `after_remark` varchar
(255) NOT NULL DEFAULT '' COMMENT '售后备注' AFTER `after_status`;