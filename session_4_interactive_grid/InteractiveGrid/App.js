// Custom Rally App that displays Defects in a grid and filter by Iteration and/or Severity.
//
// Note: various console debugging messages intentionally kept in the code for learning purposes

Ext.define('CustomApp', {
    extend: 'Rally.app.App',      // The parent class manages the app 'lifecycle' and calls launch() when ready
    componentCls: 'app',          // CSS styles found in app.css

	items: [
		{ this container for us control layout of pulldwon,and add below		xtype: 'container',
		itemId: 'pulldown-container',
		layout: {
			type: 'hbox', //horizontal layout
			align: 'stretch'
			}
		}
		], 

    defectStore: undefined,       // app level references to the store and grid for easy access in various methods
    defectGrid: undefined,

    // Entry Point to App
    launch: function() {

	var me= this;

      console.log('our second app');     // see console api: https://developers.google.com/chrome-developer-tools/docs/console-api

	me._loadIterations: function();
	},

	//create iteration pulldown and load iterations
	_loadIterations: function() {
		var me= this;
		var iterComboBox = Ext.create('Rally.ui.combobox.IterationComboBox', {
			itemId: 'iteration-combobox',
			fieldLabel: 'Iteration',
			labelAlign: 'right',
			width: 300,
			listeners: {
					ready: me._loadSeverities,
					select: me._loadData,
					scope: me
				   }
	});
	
	//add the iteration list to pulldown container so layout horiz,not d app
	  this.down('#pulldown-container').add(iterComboBox);
	},

	//create defect severity pulldown then load data
	_loadSeverities: function() {
		var me = this;
		var severityComboBox = Ext.create('Rally.ui.combobox.FieldValueComboBox', {
		itemId: 'severity-combobox',
		model: 'Defect',
		field: 'Severity',
		labelAlign: 'right',
		listeners: {
				ready: me._loadData,
				select: me._loadData,
				scope: me //dont forget to pass 'app' level scope into combobobx so the async event call app-level func's!
			    }
	  });	   

	//add severity list to pulldown container so it layou horiz.not the app
	this.down('#pulldown-container').add(severityComboBox);
	},

	//consturct filters for defect v given iteration(ref)/severity value
	_getFIlters: function(iterationValue, severityValue) {
		var iterationFilter = Ext.create('Rally.data.wsapi.filter', {
			property: 'Iteration',
			operation: '=',
			value: severityValue
			});

		return iterationFilter.and(severityFilter);
		},

	//get data from rally
	_loadData: function() {
		var me = this;


	//the _ref is unique, unlike iteration name tht can change; lets query on it instead
	var selectedIterRef = this.down('#iteration-combobox').getRecord().get('_ref');

	//rmbr to console log the record to see raw data n realize wat can be pluck out
	var selectedSeverityValue = this.down('#severity-combobox').getRecord().get('value');  

	var myFilters =this._getFilters(selectedIterRef, selectedSeverityValue);
	console.log('myfilter', myFilters.toString());

      // if store exists, just load new data
      if (me.defectStore) {
        console.log('store exists');
        me.defectStore.setFilter(myFilters);
        me.defectStore.load();

      // create store
      } else {
        console.log('creating store');
        me.defectStore = Ext.create('Rally.data.wsapi.Store', {     // create defectStore on the App (via this) so the code above can test for it's existence!
          model: 'Defect',
          autoLoad: true,                         // <----- Don't forget to set this to true! heh
          filters: myFilters,
          listeners: {
              load: function(myStore, myData, success) {
                  console.log('got data!', myStore, myData);
                  if (!me.defectGrid) {           // only create a grid if it does NOT already exist
                    me._createGrid(myStore);      // if we did NOT pass scope:this below, this line would be incorrectly trying to call _createGrid() on the store which does not exist.
                  }
              },
              scope: me                         // This tells the wsapi data store to forward pass along the app-level context into ALL listener functions
          },
          fetch: ['FormattedID', 'Name', 'Severity', 'Iteration']   // Look in the WSAPI docs online to see all fields available!
        });
      }
    },

    // Create and Show a Grid of given defect
    _createGrid: function(myDefectStore) {
	var me =this;
      me.defectGrid = Ext.create('Rally.ui.grid.Grid', {
        store: myDefectStore,
        columnCfgs: [         // Columns to display; must be the same names specified in the fetch: above in the wsapi data store
          'FormattedID', 'Name', 'Severity', 'Iteration'
        ]
      });

      me.add(me.defectGrid);       // add the grid Component to the app-level Container (by doing this.add, it uses the app container)

    }

});
