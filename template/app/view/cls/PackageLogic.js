/**
 * Creates package-based tree-structure.
 */
Ext.define('Docs.view.cls.PackageLogic', {
    /**
     * @cfg {Object[]} classes (required) An array of classes.
     * @cfg {String} classes.name
     * @cfg {String} classes.extends
     * @cfg {String} classes.icon
     */

    /**
     * Initializes tree creator.
     * @param {Object} cfg
     */
    constructor: function(cfg) {
        Ext.apply(this, cfg);
    },

    /**
     * Creates the tree.
     * @return {Object} the tree.
     */
    create: function() {
        this.root = {
            children: [],
            text: 'Root'
        };
        this.packages = {"": this.root};
        Ext.Array.forEach(this.classes, this.addClass, this);
        this.sortTree(this.root);
        return this.root;
    },

    // Sorts all child nodes, and recursively all child packages.
    sortTree: function(node) {
      node.children.sort(this.compare, this);
      Ext.Array.forEach(node.children, function(c) {
          c.children && this.sortTree(c);
      }, this);
    },

    // Comparson method that sorts package nodes before class nodes.
    compare: function(a, b) {
        if (a.leaf === b.leaf) {
            var aa = a.text.toLowerCase();
            var bb = b.text.toLowerCase();
            return aa > bb ? 1 : (aa < bb ? -1 : 0);
        }
        else {
            return a.leaf ? 1 : -1;
        }
    },

    // When package for the class exists, add class node to that
    // package; otherwise create the package first.
    addClass: function(cls) {
        var parentName = this.packageName(cls.name);
        var parent = this.packages[parentName] || this.addPackage(parentName);
        parent.children.push(this.classNode(cls));
    },

    // When parent package exists, add new package node into it, also
    // record the package into this.packages hash for quick lookups;
    // otherwise create the parent package first.
    //
    // Note that the root package always exists, so we can safely
    // recurse knowing we will eventually stop.
    addPackage: function(name) {
      var parentName = this.packageName(name);
      var parent = this.packages[parentName] || this.addPackage(parentName);
      var pkg = this.packageNode(name);
      parent.children.push(pkg);
      this.packages[name] = pkg;
      return pkg;
    },

    // Given full doc object for class creates class node
    classNode: function(cls) {
      return {
        text: this.shortName(cls.name),
        url: "/api/"+cls.name,
        iconCls: cls.icon,
        leaf: true
      };
    },

    // Given full package name like my.package creates package node
    packageNode: function(name) {
      return {
        text: this.shortName(name),
        iconCls: "icon-pkg",
        children: []
      };
    },

    // Utility method that given a package or class name finds the name
    // of its parent package.
    packageName: function(name) {
      return name.slice(0, -this.shortName(name).length - 1) || "";
    },

    // Utility method that given full package or class name extracts
    // the "class"-part of the name.
    //
    // Because we try to emulate ext-doc, it's not as simple as just
    // taking the last part.
    shortName: function(name) {
      var parts = name.split(/\./);
      var srt = parts.pop();
      while (parts.length > 1 && /^[A-Z]/.test(parts[parts.length-1])) {
        srt = parts.pop() + "." + srt;
      }
      return srt;
    }

});