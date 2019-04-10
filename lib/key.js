'use strict';
/**
 * An object wrapper for easier use of registry api
 */
class Key {
    constructor(pHKeyOrPredefined, path, accessLevel) {
        if (path.indexOf('\\') == 0) {
            path = path.slice(1, path.length);
        }
        var isPredefined = false;
        this._registry = require('./registry');
        this._windef = require('./windef');
        this.accessLevel = accessLevel;
        for (var k in this._windef.HKEY) {
            if (this._windef.HKEY[k] === pHKeyOrPredefined) {
                isPredefined = true;
                break;
            }
        }

        // this is a predefined key
        if (isPredefined) {
            if (path.indexOf('\\') != -1) {
                var pos = path.indexOf('\\', 1);
                var path1 = path.slice(0, pos);
                var subKeyName = path.slice(pos + 1, path.length);
                var key = this._registry.openKeyFromPredefined(pHKeyOrPredefined, path1, accessLevel);
                return key.openSubKey(subKeyName);
            } else {
                return this._registry.openKeyFromPredefined(pHKeyOrPredefined, path, accessLevel);;
            }
            return
        }

        this.handle = pHKeyOrPredefined;
        this.path = path;
    }

    /**
    * Closes this Key, releasing the native OS handle
    * all the containers matching the query. Automatically closes current key
    */
    close() {
        this._registry.closeKey(this);
    }

    deleteKey() {
        this._registry.deleteKey(this);
    }

    /**
     * Deletes a value from a key
     */
    deleteValue(value) {
        this._registry.deleteValue(this, value);
    }

    /**
    * Sets a value for a value name on this key
    * all the containers matching the query.
    * @param  {DS.Record Container} selectedContainer - The container to be selected
    */
    setValue(valueName, valueType, value) {
        this._registry.setValueForKeyObject(this, valueName, valueType, value);
    }

    getValue(valueName) {
        return this._registry.queryValueForKeyObject(this, valueName);
    }

    /**
    * Returns a new Key object given a subkeyName
    * @param  {string} subKeyName - The container to be selected
    * @param  {string} accessLevel - The container to be selected
    * @return {Key}
    */
    openSubKey(subKeyName, accessLevel = null) {
        if (accessLevel == null) {
            accessLevel = this.accessLevel;
        }
        if (subKeyName.indexOf('\\') == 0) {
            subKeyName = subKeyName.slice(1, subKeyName.length);
        }
        if (subKeyName.indexOf('\\') != -1) {
            var pos = subKeyName.indexOf('\\', 1);
            var path1 = subKeyName.slice(0, pos);
            var path2 = subKeyName.slice(pos + 1, subKeyName.length);
            key = this.openSubKey(path1, accessLevel);
            return key.openSubKey(path2, accessLevel);
        } else {
            var key = this._registry.openKeyFromKeyObject(this, subKeyName, accessLevel);
            return key;
        }
    }

    createSubKey(subKeyName, accessLevel) {
        this._registry.createKey(this, subKeyName, accessLevel);

        return new Key(this.handle, subKeyName, accessLevel);
    }

    /**
     * Returns the string representing this Key
     */
    toString() {
        return this.path;
    }
}

module.exports = Key;
