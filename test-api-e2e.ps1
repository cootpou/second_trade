# 校园二手交易平台 —— 端到端接口自测脚本
# 全部请求都走 Nginx 网关（默认 http://127.0.0.1），验证前端页面依赖的接口是否正常
#
# 用法：powershell -ExecutionPolicy Bypass -File .\test-api-e2e.ps1

$Base = 'http://127.0.0.1'
$ErrorActionPreference = 'Stop'

function Invoke-Api {
    param(
        [string]$Method = 'GET',
        [string]$Path,
        $Body = $null,
        [string]$Token
    )
    $headers = @{}
    if ($Token) { $headers['token'] = $Token }
    $req = @{
        Uri             = $Base + $Path
        Method          = $Method
        Headers         = $headers
        UseBasicParsing = $true
        TimeoutSec      = 15
    }
    if ($null -ne $Body) {
        $json = $Body | ConvertTo-Json -Depth 6 -Compress
        $req['Body'] = [System.Text.Encoding]::UTF8.GetBytes($json)
        $req['ContentType'] = 'application/json; charset=utf-8'
    }
    $resp = Invoke-WebRequest @req
    return [System.Text.Encoding]::UTF8.GetString($resp.RawContentStream.ToArray()) | ConvertFrom-Json
}

function Step($text) { Write-Host "`n=== $text ===" -ForegroundColor Cyan }

Step '1. 登录（zhangsan / lisi）'
$loginZ = Invoke-Api -Method POST -Path '/api/user/login' -Body @{ username = 'zhangsan'; password = '123456' }
$loginL = Invoke-Api -Method POST -Path '/api/user/login' -Body @{ username = 'lisi'; password = '123456' }
$tokenZ = $loginZ.data.token
$tokenL = $loginL.data.token
Write-Host "zhangsan id=$($loginZ.data.id), lisi id=$($loginL.data.id)"

Step '2. 商品广场（分页 + 关键字 + 分类）'
$page = Invoke-Api -Path '/api/product/page?page=1&pageSize=5&status=active'
Write-Host "在售商品总数：$($page.data.total)"
$cats = Invoke-Api -Path '/api/product/categories'
Write-Host ("分类：" + ($cats.data -join '、'))

Step '3. zhangsan 发布一件测试商品（已存在则复用）'
$myAll = Invoke-Api -Path '/api/product/my?page=1&pageSize=50' -Token $tokenZ
$demo = $myAll.data.records | Where-Object { $_.title -like '*【演示】*' } | Select-Object -First 1
if ($demo) {
    $productId = $demo.id
    $null = Invoke-Api -Method POST -Path "/api/product/status/$productId`?status=active" -Token $tokenZ
    Write-Host "复用已有商品 id=$productId"
} else {
    $newProduct = Invoke-Api -Method POST -Path '/api/product' -Token $tokenZ -Body @{
        title         = '【演示】九成新护眼台灯'
        description   = '宿舍自用，三档亮度，可充电，附赠数据线。'
        price         = 35.00
        originalPrice = 89.00
        category      = '生活用品'
        condition     = '九成新'
        location      = '图书馆一楼'
    }
    $mine = Invoke-Api -Path '/api/product/my?page=1&pageSize=5&status=active' -Token $tokenZ
    $productId = $mine.data.records[0].id
    Write-Host "新建商品 id=$productId"
}
$mine = Invoke-Api -Path '/api/product/my?page=1&pageSize=5&status=active' -Token $tokenZ
Write-Host "我发布的商品数=$($mine.data.total)"

Step '4. 商品详情'
$detail = Invoke-Api -Path "/api/product/detail/$productId"
Write-Host "详情：$($detail.data.title) / ¥$($detail.data.price) / 卖家=$($detail.data.sellerName)"

Step '5. lisi 收藏 → 查看 → 取消收藏'
$null = Invoke-Api -Method POST -Path "/api/favorite/$productId" -Token $tokenL
$chk = Invoke-Api -Path "/api/favorite/check/$productId" -Token $tokenL
Write-Host "是否已收藏：$($chk.data)"
$favs = Invoke-Api -Path '/api/favorite/my?page=1&pageSize=5' -Token $tokenL
Write-Host "我的收藏条数：$($favs.data.total)"
$null = Invoke-Api -Method DELETE -Path "/api/favorite/$productId" -Token $tokenL

Step '6. lisi 下单'
$orderId = (Invoke-Api -Method POST -Path '/api/order/submit' -Token $tokenL -Body @{
    productId      = $productId
    paymentMethod  = '微信支付'
    deliveryMethod = '当面交易'
    meetupLocation = '图书馆一楼'
    meetupTime     = '2026-10-08T12:00:00'
}).data
Write-Host "订单号：$orderId"
$buyerOrders = Invoke-Api -Path '/api/order/buyer?page=1&pageSize=5' -Token $tokenL
Write-Host "买家订单：$($buyerOrders.data.records[0].productTitle) / $($buyerOrders.data.records[0].status)"

Step '7. lisi 付款 → zhangsan 确认完成'
$null = Invoke-Api -Method POST -Path "/api/order/pay/$orderId" -Token $tokenL
$sellerOrders = Invoke-Api -Path '/api/order/seller?page=1&pageSize=5' -Token $tokenZ
Write-Host "卖家订单状态：$($sellerOrders.data.records[0].status)"
$null = Invoke-Api -Method POST -Path "/api/order/complete/$orderId" -Token $tokenZ
$detail2 = Invoke-Api -Path "/api/order/$orderId" -Token $tokenL
Write-Host "订单最终状态：$($detail2.data.status)"

Step '8. 站内消息（lisi ↔ zhangsan）'
$null = Invoke-Api -Method POST -Path '/api/message/send' -Token $tokenL -Body @{
    receiverId = $loginZ.data.id; productId = $productId; content = '你好，台灯还在吗？'; messageType = 'text'
}
$null = Invoke-Api -Method POST -Path '/api/message/send' -Token $tokenZ -Body @{
    receiverId = $loginL.data.id; productId = $productId; content = '在的，明天中午图书馆一楼面交可以吗？'; messageType = 'text'
}
$convs = Invoke-Api -Path '/api/message/conversations' -Token $tokenL
Write-Host "lisi 的会话数：$(($convs.data).Count)，最后一条：$($convs.data[0].lastMessageContent)"
$unread = Invoke-Api -Path '/api/message/unread-count' -Token $tokenL
Write-Host "lisi 未读消息：$($unread.data)"
$chat = Invoke-Api -Path "/api/message/conversation?otherUserId=$($loginZ.data.id)&productId=$productId" -Token $tokenL
Write-Host "聊天记录条数：$(($chat.data).Count)"

Step '9. 当前登录用户'
$me = Invoke-Api -Path '/api/user/current' -Token $tokenL
Write-Host "当前用户：$($me.data.username)，信用分：$($me.data.creditScore)，余额：$($me.data.balance)"

Write-Host "`n全部接口自测通过 ✅" -ForegroundColor Green
