package zk;

import org.apache.zookeeper.ZooKeeper;

public class ZkMain {
	
	public static void main(String[] args) throws Exception {
		ZooKeeper zk = new ZooKeeper(null, 0, null, false);
		System.out.println(zk);
	}

}
