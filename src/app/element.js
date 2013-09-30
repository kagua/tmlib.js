/*
 * 
 */

tm.app = tm.app || {};


(function() {
    
    /**
     * @class
     * アプリケーション用オブジェクトの基底となるクラス
     */
    tm.app.Element = tm.createClass({
        
        superClass: tm.event.EventDispatcher,
        
        parent: null,
        children: null,
        
        /**
         * 初期化
         */
        init: function() {
            
            this.superInit();
            
            this.children = [];
            this._listeners = {};
        },
        
        /**
         * 親から離れる
         */
        remove: function()
        {
            console.assert(this.parent);
            this.parent.removeChild(this);

            this.parent = null;
            
            return this;
        },
        
        /**
         * 子供を追加
         */
        addChild: function(child) {
            if (child.parent) child.remove();
            child.parent = this;
            this.children.push(child);

            var e = tm.event.Event("added");
            child.dispatchEvent(e);
            
            return child;
        },
        
        /**
         * parent に自分を子供として追加
         */
        addChildTo: function(parent) {
            parent.addChild(this);
            
            // if (this.parent) this.remove();
            // this.parent = parent;
            // parent.children.push(child);
            
            return this;
        },
        
        /**
         * まとめて追加
         * scene 遷移時に子供をごっそり移譲するときなどに使用
         * まだ動作確認していない
         */
        addChildren: function(children)
        {
            var tempChildren = children.slice();
            for (var i=beginIndex,len=tempChildren.length; i<len; ++i) {
                this.addChild(tempChildren[i]);
            }
        },
        
        /**
         * index 指定で要素を追加
         */
        addChildAt: function(child, index) {
            if (child.parent) child.remove();
            child.parent = this;
            this.children.splice(index, 0, child);

            var e = tm.event.Event("added");
            child.dispatchEvent(e);

            return child;
        },
        
        /**
         * index 指定で要素を取得
         */
        getChildAt: function(child) {
            return this.children.indexOf(child);
        },
        
        /**
         * child に一致するエレメントを離す
         */
        removeChild: function(child)
        {
            var index = this.children.indexOf(child);
            if (index != -1) {
                this.children.splice(index, 1);
                var e = tm.event.Event("removed");
                child.dispatchEvent(e);
            }
        },
        
        /**
         * すべての child を離す
         */
        removeChildren: function(beginIndex)
        {
            beginIndex = beginIndex || 0;
            var tempChildren = this.children.slice();
            for (var i=beginIndex,len=tempChildren.length; i<len; ++i) {
                tempChildren[i].remove();
            }
            this.children = [];
        },
        
        /**
         * 名前の一致する child を取得
         */
        getChildByName: function(name)
        {
            for (var i=0,len=this.children.length; i<len; ++i)
                if (this.children[i].name == name) return this.children[i];
            
            return null;
        },
        
        /**
         * 関数実行
         */
        execChildren: function(func, args)
        {
            args = (args && args.length) ? args : [args];
            // 関数内で remove される可能性があるので配列をコピーする
            var tempChildren = this.children.slice();
            for (var i=0,len=tempChildren.length; i<len; ++i) {
                func.apply(tempChildren[i], args);
            }
        },
        
        /**
         * 親を取得
         */
        getParent: function() { return this.parent; },
        
        /**
         * ルートを取得
         */
        getRoot: function() {
            if (!this.parent) return null;
            // TODO: 親をたどって NULL だったらそのエレメントを返す
            var elm = null;
            for (elm=this.parent; elm.parent != null; elm = elm.parent) {}
            return elm;
        },
        
        fromJSON: function(data) {
            for (var key in data) {
                var value = data[key];
                if (key == "children") {
                    for (var i=0,len=value.length; i<len; ++i) {
                        var data = value[i];
                        var init = data["init"] || [];
                        var type = (DIRTY_CLASS_MAP[data.type]) ? DIRTY_CLASS_MAP[data.type] : data.type;
                        var _class = tm.using(type);
                        
                        console.assert(Object.keys(_class).length !== 0, _class + " is not defined.");
                        
                        var elm = _class.apply(null, init).addChildTo(this);
                        elm.fromJSON(data);
                        this[data.name] = elm;
                    }
                }
                else {
                    this[key] = value;
                }
            }

            return this;
        },
        
    });

    var DIRTY_CLASS_MAP = {
        "Sprite"            : "tm.display.Sprite",
        "Label"             : "tm.display.Label",
        "Shape"             : "tm.display.Shape",
        "CircleShape"       : "tm.display.CircleShape",
        "TriangleShape"     : "tm.display.TriangleShape",
        "RectangleShape"    : "tm.display.RectangleShape",
        "StarShape"         : "tm.display.StarShape",
        "PolygonShape"      : "tm.display.PolygonShape",
        "HeartShape"        : "tm.display.HeartShape",
        "AnimationSprite"   : "tm.display.AnimationSprite",
        
        "LabelButton"       : "tm.ui.LabelButton",
        "IconButton"        : "tm.ui.IconButton",
        "GlossyButton"      : "tm.ui.GlossyButton",
        "FlatButton"        : "tm.ui.FlatButton",
    };
    
})();
