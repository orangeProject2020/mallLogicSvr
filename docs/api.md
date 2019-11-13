### 创建订单 `/order/create`

#### 入参

```json
{
  "user_id": "xxxxxx",
  "orders": [
    {
      "business_id": 0,
      "goods_items": [
        {
          "goods_id": 1,
          "num": 1
        },
        {
          "goods_id": 2,
          "num": 2
        }
      ],
      "score": 0 // 使用积分
    }
  ],
  "address": {},
  "remark": ""
}
```

#### 出参

```json
{
  "orders":[
    {
      "id":"",
      "total":"",
      ...
      "items":[
        {}
      ]
    }
  ]
}
```

### 创建支付账单

#### 入参

```json
{
  "user_id": "xxxxxx",
  "order_ids": [],
  "total": 0,
  "amount": 0,
  "score": 0,
  "pay_type": 0,
  "pay_method": 0,
  "balance": 0,
  "coupon": 0,
  "user_coupon_id": 0
}
```

#### 出参

```json
{
  "out_trade_no": "xxxxxx"
}
```
