/**
 * Created by cherish on 2017/12/20.
 */
/*!
 * $.Delegate Engine v1.0
 *
 * Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Copyright 2013 syany
 * Dual licensed under the MIT or GPL Version 3 licenses.
 * Date: 2014-08-05
 */
(function($, window, undefined) {
    var DELEGATE_DATAKEY = 'delegateInstance';
    /**
     * @class 委譲クラス生成クラス。 対象クラスのインスタンスメソッド、クラスメソッド及びプロパティを作成します。
     * @constructor
     * @extends $
     */
    $.Delegate = function() {
        /** @lends $.Delegate */
        if ($.isFunction(this)) {
            throw Error('Kill if you didn\'t use the \'new\'.');
        }
        // 実コンストラクタ
        this.constructor_.apply(this, arguments);
    };

    // インスタンス基底プロパティ、メソッド群
    $.extend($.Delegate.prototype, {
        /** @lends $.Delegate# */
        /**
         * @type 委譲対象クラス
         */
        delegateClass : Function,
        /**
         * $.Delegateクラスオブジェクトを初期化します。 <br>
         * ・委譲メソッドを生成します。
         */
        constructor_ : function() {
            // 複数の引数パターンに対応するために、new, bindを使用する
            this._DELEGATE_OBJ_ = this.newDelegateInstance.apply(this, arguments || []);
            /**
             * 委譲メソッドを作成します。
             */
                // 委譲元Dateのインスタンスメソッド、プロパティのリストを取得し、リスト分繰り返す。
            var propertyNames = this.getPropertyNames(this.delegateClass.prototype);
            for (var i = 0, p = propertyNames[i]; (p = propertyNames[i]); i++) {
                (function(that) {
                    var propertyName = p;
                    $.Delegate.delegateProperty(that, that._DELEGATE_OBJ_, propertyName);
                })(this);
            }
        },
        /**
         * 対象のプロパティ名称をリストで返却します。
         *
         * @param {Object}
         *        source
         * @MemberOf $.Delegate#
         */
        getPropertyNames : function(source) {
            return (!!Object.getOwnPropertyNames) ? Object.getOwnPropertyNames(source) : [];
        },
        /**
         * 委譲クラスのメソッドを実行する。
         * @param {String} method 委譲クラスのメソッド名
         * @param {Array} args 委譲メソッドノ］引数配列
         */
        delegateMethod : function(delegateMethod, args) {
            return this._DELEGATE_OBJ_[delegateMethod].apply(this._DELEGATE_OBJ_, args || []);
        },
        /**
         * 委譲クラスをインスタンス化
         * @return インスタンス化したオブジェクト
         */
        newDelegateInstance : function() {
            //return new (this.delegateClass.bind.apply(this.delegateClass, [ undefined ].concat([].slice.call(arguments))))();
            return (!!arguments[0] && arguments[0] instanceof Array) ? new (this.delegateClass.bind.apply(this.delegateClass, [ undefined ].concat([].slice
                .call(arguments[0]))))() : new (this.delegateClass.bind.apply(this.delegateClass, [ undefined ].concat([].slice.call(arguments))))();
        },
        /**
         * 委譲元インスタンスを返却します。<br>
         *
         * @return {Object} 委譲元のインスタンス
         */
        getDelegateClass : function() {
            return this._DELEGATE_OBJ_;
        }
    });

    // インスタンス基底プロパティ、メソッド群
    $.extend($.Delegate, {
        /**
         *
         */
        newInstance : function(sourceClass) {
            return (!!arguments[1] && arguments[1] instanceof Array) ? new (sourceClass.bind.apply(sourceClass, [ undefined ].concat([].slice
                .call(arguments[1]))))() : new (sourceClass.bind.apply(sourceClass, [].slice.call(arguments)))();
        },
        /** @lends $.Delegate */
        /**
         * $.Delegateのインスタンスを返却する。 スタティック領域に保存し、１リクエスト中のスコープはシングルトンとなる。
         *
         * @MemberOf $.Delegate
         */
        getInstance : function() {
            var $delegate = $.data(this, DELEGATE_DATAKEY);
            if (!!$delegate) {
                return $delegate;
            }
            // 複数の引数パターンに対応するために、new, bindを使用する
            $delegate = $.Delegate.newInstance.apply($.Delegate.newInstance, [ this ].concat([].slice.call(arguments)));

            $.data(this, DELEGATE_DATAKEY, $delegate);
            return $delegate;
        },
        /**
         * スタティック領域に保存した$.Delegateインスタンスを破棄する（※再作成するために利用する)
         */
        removeInstance : function() {
            $.removeData(this, DELEGATE_DATAKEY);
            return this;
        },
        /**
         * 委譲プロパティを設定します
         *
         * @param {Object}
         *        target
         * @param {Object}
         *        source
         * @param {Object}
         *        propertyName
         */
        delegateProperty : function(target, source, propertyName) {
            if (!!target[propertyName]) {
                return;
            }
            var name = propertyName;
            // メソッドであればメソッド、プロパティであればプロパティの形式で委譲
            if ($.isFunction(source[name])) {
                target[name] = function() {
                    var result = source[name].apply(source, arguments);
                    return /^set/.test(name) ? target : result;
                };
            } else {
                target[name] = source[name];
            }
        },
        /**
         * 対象のプロパテイファイルを設定
         *
         * @param {Object}
         *        targetClass
         * @param {Object}
         *        sourceClass
         */
        delegateClassProparties : function(targetClass, sourceClass) {
            // クラスプロパティを設定します
            var classPropertyNames =
                (!!targetClass.prototype.getPropertyNames) ? targetClass.prototype.getPropertyNames(sourceClass) : $.Delegate.prototype
                    .getPropertyNames(sourceClass);
            for (var i = 0, cp = classPropertyNames[i]; (cp = classPropertyNames[i]); i++) {
                (function(thisClass) {
                    var classPropertyName = cp;
                    // 対象プロパティには設定しない
                    if (/^(?:arguments|caller|prototype)$/.test(classPropertyName)) {
                        return;
                    }
                    // 設定済みには対応しない
                    if (!!thisClass[classPropertyName]) {
                        return;
                    }
                    // プロパティ設定メイン
                    $.Delegate.delegateProperty(thisClass, sourceClass, classPropertyName);
                })(targetClass);
            }
        },
        /**
         * 第2引数のクラスで委譲した第一引数のクラスを返す。
         *
         * @param {Object}
         *        targetClass
         * @param {Object}
         *        originalClass
         */
        inheritInstance : function(originalClass, targetClass) {
            var T = targetClass || Function;
            var O = originalClass;
            var F = function() {
                if ($.isFunction(this)) {
                    return O.apply(O, arguments);
                }
                $.Delegate.apply(this, arguments);
                T.apply(this, arguments);
            };

            // 通常継承
            F.prototype = Object.create($.Delegate.prototype);
            // jQuery的継承
            $.extend(F, $.Delegate);
            $.extend(F.prototype, {
                delegateClass : O
            });
            // クラス変数、関数追加
            F.delegateClassProparties(F, O);
            F.classDelegateMethod = function(delegateMethod, args) {
                return O[delegateMethod].apply(O, args || []);
            };
            return F;
        }
    });
})(jQuery, window);