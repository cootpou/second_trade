const fs = require('fs');
const p = 'D:/Downloads/second_hand_trade/nginx-1.20.2/conf/nginx.conf';
let s = fs.readFileSync(p, 'utf8');
const anchor = `		# 反向代理,处理用户端发送的请求（本项目暂未使用，保留示例）
        # location /user/ {
        #     proxy_pass   http://webservers/user/;
        # }`;
const add = `${anchor}
			
		# 反向代理,处理商品图片请求（后端静态资源 /images/）
        location /images/ {
            proxy_pass   http://webservers;
        }`;
if (s.indexOf('location /images/') === -1) {
  s = s.replace(anchor, add);
  fs.writeFileSync(p, s, 'utf8');
  console.log('images location added');
} else {
  console.log('already exists');
}
