package ali.middleware.velocity;

import java.util.Date;

import org.apache.velocity.tools.config.DefaultKey;
import org.apache.velocity.tools.generic.SafeConfig;

/**
 * velocity自定义Tool，详见 http://gitlab.alibaba-inc.com/middleware-container/pandora-boot/wikis/spring-boot-velocity
 * 
 * @author chengxu
 */
@DefaultKey("dateTool")
public class DateTool extends SafeConfig {

    public Date now() {
        return new Date();
    }
}
