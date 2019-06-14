define(['base/js/namespace', 'jquery', 'base/js/dialog', 'base/js/utils', 'require', './git-shared-components'], function (Jupyter, $, dialog, utils, require, sharedComponents) {

    // -------- GLOBAL VARIABLES -----------------------

    var basePathRegex = "^(\/.+)+\/(tree|notebooks|edit|terminals)";
    var basePath = (window.location.pathname.match(basePathRegex) == null) ? "" : (window.location.pathname.match(basePathRegex)[1] + '/');
    if (!basePath) {
        basePath = "/"
    }

    // ----------- HANDLER -------------------------------

    var components = require('./git-shared-components');
    var components = new sharedComponents();

    //---------- REGISTER EXTENSION ------------------------
    /**
     * Adds the jupyter extension to the tree view (including the respective handler)
     */
    function load_ipython_extension() {
        // log to console
        console.info('Loaded Jupyter extension: Juypter Git Helper')
        base_url = utils.get_body_data('base-url')

        btGitButton = '<div id="start-git-btn" style="margin-right: 5px;">' +
            '<button id="gitTreeButton" class="btn btn-default btn-xs" style="padding: 5px 10px;">' +
            '<span>Git</span>' +
            '</button></div>';

        var btGitButtonInTabView = '<button id="gitTreeButton" title="Open Git Helper" aria-label="Open Git Helper" style="margin-left: 4px;" class="btn btn-default btn-xs"><i class="fa-git fa"></i></button>'

        $('#alternate_upload').before(btGitButtonInTabView);

        $('#gitTreeButton').click(function () {
            var tree_dir = '/' + window.document.body.dataset.notebookPath;
            console.log("Current Path: " + tree_dir)
            components.getGitInfo(tree_dir, function (data) {
                console.log("git infor data:")
                console.log(data)

                let ungitPath = data["requestPath"]
                if (data["repoRoot"]) {
                    ungitPath = data["repoRoot"]
                }
                ungitPath = encodeURIComponent(ungitPath)

                let name = data["userName"]
                let email = data["userEmail"]
                if (Boolean(name) == false || Boolean(email) == false) {
                    components.openSettingsDialog(name, email, tree_dir, function (data) {
                        window.open(basePath + "tools/ungit/#/repository?path=" + ungitPath, '_blank');
                    });
                } else {
                    window.open(basePath + "tools/ungit/#/repository?path=" + ungitPath, '_blank');
                }
            });

        });

        // tensorboard button when select a directory
        $(".dynamic-buttons:first").append('<button id="#commit-push-button" title="Commit and push file" class="commit-push-button btn btn-default btn-xs">Commit & Push</button>');

        $(".commit-push-button").click(function () {
            components.openCommitSingleDialog(Jupyter.notebook_list.selected[0].path);
        });

        var _selection_changed = Jupyter.notebook_list.__proto__._selection_changed;
        Jupyter.notebook_list.__proto__._selection_changed = function () {
            _selection_changed.apply(this);
            selected = this.selected;
            if (selected.length == 1 && selected[0].type !== 'directory') {
                $('.commit-push-button').css('display', 'inline-block');
            } else {
                $('.commit-push-button').css('display', 'none');
            }
        };
        Jupyter.notebook_list._selection_changed();
    }

    // Loads the extension
    return {
        load_ipython_extension: load_ipython_extension
    };
});