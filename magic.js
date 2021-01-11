const STATIC = 0
const MEMBER = 1

function deal(target, name, type) {
    let _get, _call

    if (STATIC === type) {
        _get = '__getStatic'
        _call = '__callStatic'
    } else if (MEMBER === type) {
        _get = '__get'
        _call = '__call'
    } else {
        throw new Error(`Unknown type ${type}.`)
    }

    if (name in target) {
        if (_call === name || _get === name) {
            throw new Error(`Cannot access ${name} method!`)
        }
        return target[name]
    }

    if (name.startsWith('_') && !name.startsWith('__')) {
        return target[_get](name)
    }
    return function() {
        let args = Array.from(arguments)
        return target[_call](name, args)
    }
}

function magic(cls) {
    return new Proxy(cls, {
        get(target, name) {
            return deal(target, name, STATIC)
        },

        construct(targetClass, argArray) {
            let instance = new targetClass(...argArray)
            return new Proxy(instance, {
                get(target, name) {
                    return deal(target, name, MEMBER)
                }
            })
        }
    })
}

module.exports = magic