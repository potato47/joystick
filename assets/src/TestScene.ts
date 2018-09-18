import { JoystickEvent, Joystick } from "../components/joystick/Joystick";

const { ccclass, property } = cc._decorator;

@ccclass
export class TestScene extends cc.Component {

    @property(cc.Node)
    private playerNode: cc.Node = null;
    @property(cc.Integer)
    private speed: number = 300;

    private moveDirVec: cc.Vec2 = cc.v2();

    handleMove(event: JoystickEvent) {
        this.moveDirVec = Joystick.GetDirVecByDir(event.newDir);
    }

    update(dt: number) {
        let distance = this.speed * dt;
        let moveVec = this.moveDirVec.mul(distance);
        this.playerNode.position = this.playerNode.position.add(moveVec);
    }

}
