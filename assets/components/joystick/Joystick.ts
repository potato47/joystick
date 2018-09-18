const { ccclass, property } = cc._decorator;

export enum Direction {
    IDLE, LEFT, UP, RIGHT, DOWN, LEFT_UP, RIGHT_UP, LEFT_DOWN, RIGHT_DOWN
}

export interface JoystickEvent {
    oldDir: Direction;
    newDir: Direction;
}

@ccclass
export class Joystick extends cc.Component {

    @property(cc.Boolean)
    private interactable = true;
    @property({
        tooltip: '是否固定位置'
    })
    private fixed = true;
    @property(cc.Node)
    private background: cc.Node = null;
    @property(cc.Node)
    private bar: cc.Node = null;
    @property([cc.Component.EventHandler])
    private moveEvents: cc.Component.EventHandler[] = [];

    private radius: number;
    private _dirction = Direction.IDLE;
    private originPos: cc.Vec2;
    private get direction() {
        return this._dirction;
    }
    private set direction(newDir) {
        if (newDir === this.direction) return;
        cc.Component.EventHandler.emitEvents(this.moveEvents, { oldDir: this.direction, newDir: newDir });
        this._dirction = newDir;
    }

    start() {
        this.radius = this.background.width / 2;
        this.direction = Direction.IDLE;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.originPos = this.background.position;
    }

    private onTouchStart(event: cc.Event.EventTouch) {
        if (!this.interactable) return;
        if (!this.fixed) {
            this.background.position = this.node.convertToNodeSpaceAR(event.getLocation());
        } else {
            this.onTouchMove(event);
        }
    }

    private onTouchMove(event: cc.Event.EventTouch) {
        if (!this.interactable) return;
        let localPos = this.background.convertToNodeSpaceAR(event.getLocation());
        this.bar.position = localPos;
        let len = localPos.mag();
        if (len > this.radius) {
            localPos.mulSelf(this.radius / len);
        }
        this.bar.position = localPos;
        let newDir = Joystick.GetDirctionByAngle(localPos.signAngle(cc.v2(-1, 0)) * 180 / Math.PI);
        this.direction = newDir;
    }

    private onTouchEnd() {
        if (!this.interactable) return;
        this.direction = Direction.IDLE;
        this.bar.position = cc.v2();
        if (!this.fixed) {
            this.background.position = this.originPos;
        }
    }

    public static GetDirctionByAngle(angle: number) {
        if (angle >= -22.5 && angle < 22.5) {
            return Direction.LEFT;
        } else if (angle >= 22.5 && angle < 67.5) {
            return Direction.LEFT_UP;
        } else if (angle >= 67.5 && angle < 112.5) {
            return Direction.UP;
        } else if (angle >= 112.5 && angle < 157.5) {
            return Direction.RIGHT_UP;
        } else if (angle >= 157.5 || angle < - 157.5) {
            return Direction.RIGHT;
        } else if (angle >= -157.5 && angle < -112.5) {
            return Direction.RIGHT_DOWN;
        } else if (angle >= -112.5 && angle < -67.5) {
            return Direction.DOWN;
        } else if (angle >= -67.5 && angle < -22.5) {
            return Direction.LEFT_DOWN;
        }
    }

    public static GetDirVecByDir(dir: Direction) {
        switch (dir) {
            case Direction.LEFT:
                return cc.v2(-1, 0);
            case Direction.UP:
                return cc.v2(0, 1);
            case Direction.RIGHT:
                return cc.v2(1, 0);
            case Direction.DOWN:
                return cc.v2(0, -1);
            case Direction.LEFT_UP:
                return cc.v2(-1, 1).normalize();
            case Direction.RIGHT_UP:
                return cc.v2(1, 1).normalize();
            case Direction.RIGHT_DOWN:
                return cc.v2(1, -1).normalize();
            case Direction.LEFT_DOWN:
                return cc.v2(-1, -1).normalize();
            default:
                return cc.v2();
        }
    }
}
