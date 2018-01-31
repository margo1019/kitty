package boot;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.boot.velocity.annotation.VelocityLayout;

/**
 * Spring Mvc的根路径、健康检查等。
 * <p>
 * 其中使用了velocity，@VelocityLayout声明了页面使用的layout。详见
 * http://gitlab.alibaba-inc.com/middleware-container/pandora-boot/wikis/spring-boot-velocity
 * 
 * @author chengxu
 */
@Controller
public class MainController {

    @GetMapping("/")
    @VelocityLayout("/velocity/layout/index.vm")
    public String root() {
        return "index";
    }

    /**
     * 健康检查
     */
    @GetMapping("/checkpreload.htm")
    public @ResponseBody String checkPreload() {
        return "success";
    }
}
