interface String {
    trunc(length: number): String;
}

//    declare var String;

/**
 * Truncate the string.
 * @param n: string length
 */
String.prototype.trunc = function (n) {
    'use strict'
    // If n=6 and
    //   length > 6, substr(0,n-2) + ...
    return this.length <= n
        ? this.substr(0, n)
        : this.substr(0, n - 1) + '\u2026';
};

module TechRadar {
    'use strict'
    /**
      * Config
      */
    var moduleName = 'techRadar.techRadarChart';

    /**
      * Module
      */
    export var myModule;
    try {
        myModule = angular.module(moduleName);
    } catch (err) {
        // named module does not exist, so create one
        myModule = angular.module(moduleName, []);
    }

    export interface RenderOptions {
        time?: string;
        category?: string;
        prio?: { [prio: number]: boolean }
    }

    export interface ITechRadarChartScope extends ng.IScope {
        technologies: Technology[];
        options: RenderOptions;
        config: csComp.Services.SpreadsheetService;
        searchterm: string;
        prioritylevel: number;
        /**
         * Start angle in degrees (0 degrees is North).
         * @type {number}
         */
        startangle?: number;
        /**
         * End angle in degrees (0 degrees is North).
         * @type {[type]}
         */
        endangle?: number;
        radius?: number;
        innerradius?: number;
        margin?: { top: number; right: number; bottom: number; left: number; };
        render(config: csComp.Services.SpreadsheetService, renderOptions?: RenderOptions): void;
        setItemVisibility(technologies: Technology, isVisible: boolean): void;
    }

    /**
      * Directive to create a sparkline chart.
      *
      * @seealso: http://odiseo.net/angularjs/proper-use-of-d3-js-with-angular-directives
      * @seealso: http://cmaurer.github.io/angularjs-nvd3-directives/sparkline.chart.html
      * @seealso: http://www.tnoda.com/blog/2013-12-19
      */
    myModule
        .directive('techRadarChart', ['$filter', 'busService',
            ($filter: ng.IFilterService, bus: csComp.Services.MessageBusService): ng.IDirective => {

                return {
                    terminal: true,       // do not compile any other internal directives
                    restrict: 'EA',       // E = elements, other options are A=attributes and C=classes
                    transclude: true,
                    scope: {
                        config: '=',  // = means that we use angular to evaluate the expression,
                        options: '=',
                        searchterm: '=',
                        prioritylevel: '=',
                        startangle: '@',  // In degrees, 0 is north
                        endangle: '@',
                        radius: '@',  // the value is used as is
                        innerradius: '@',
                        margin: '@'
                    },
                    link: (scope: ITechRadarChartScope, element, attrs) => {

                        var c = scope.config;



                        var updateRadar = () => {

                            if (!scope.config.radial || !scope.config.horizontal) return;
                            var radial = scope.config.radial; // ["2016", "2017", "2018", "2019", "2020", "2021", "2022"];
                            var horizontal = ["very low", "low", "neutral", "high", "very high"];

                            var radius = 600; // radius of a circle
                            var thickness = 6; //thickness of a circle
                            var nr_of_segments = radial.length;
                            var nr_of_levels = horizontal.length;
                            var origin_x = 200; // distance to the right from left top
                            var origin_y = 1; // distance from the top from left top

                            var rings = d3.scale.linear().domain([0, horizontal.length + 1]).range([0, radius])
                            var padding_rings = rings(1); // distance between rings

                            var _outer_radius = radius;
                            var _inner_radius = radius - thickness;
                            var _start_angle = -0.5 * Math.PI;
                            var _end_angle = 0.5 * Math.PI;

                            var degrees = d3.scale.linear().domain([0, 180]).range([_start_angle, _end_angle]);

                            var start_angle = degrees(0);
                            var end_angle = degrees(180);

                            var _origin_x_offset = origin_x + radius;
                            var _origin_y_offset = origin_y + radius;
                            var segment = d3.scale.linear().domain([0, nr_of_segments]).range([start_angle, end_angle]);


                            //console.log(segment(4));

                            var svg = d3.select(element[0])
                                .append("svg")
                                .attr("width", _origin_x_offset * 2)
                                .attr("height", _origin_y_offset * 2)
                                .append("g")
                                .attr("transform", "translate(" + _origin_x_offset + "," + _origin_y_offset + ")");


                            for (var j = 0; j < nr_of_levels; j++) {
                                radius = radius - (j + padding_rings);
                                _outer_radius = radius;
                                _inner_radius = radius - thickness;
                                _start_angle = -0.5 * Math.PI;
                                _end_angle = 0.5 * Math.PI;


                                for (var i = 0; i < nr_of_segments; i++) {
                                    var arcId = 'arc' + i;
                                    var arc = d3.svg.arc()
                                        .innerRadius(_inner_radius)
                                        .outerRadius(_outer_radius)
                                        .startAngle(segment(i))
                                        .endAngle(segment(i + 1));

                                    var arc2 = d3.svg.arc()
                                        .innerRadius(_inner_radius)
                                        .outerRadius(_outer_radius + 50)
                                        .startAngle(segment(i))
                                        .endAngle(segment(i + 1));

                                    if (j == 0) {
                                        svg.append('text')
                                            .attr("transform", function () {
                                                var pos = arc2.centroid();
                                                pos[0] -= radial[i].length;
                                                return "translate(" + pos + ")";
                                            })
                                            .text(() => { return radial[i]; });
                                    };

                                    svg.append("path")
                                        .attr("class", "arc")                                        
                                        .attr("d", arc);

                                    var firstArcSection = /(^.+?)L/;

                                    //The [1] gives back the expression between the () (thus not the L as well) 
                                    //which is exactly the arc statement
                                    var newArc = firstArcSection.exec(d3.select(this).attr("d"))[1];
                                    //Replace all the comma's so that IE can handle it -_-
                                    //The g after the / is a modifier that "find all matches rather than stopping after the first match"
                                    newArc = newArc.replace(/,/g, " ");

                                    //Create a new invisible arc that the text can flow along
                                    svg.append("path")
                                        .attr("class", "hiddenDonutArcs")
                                        .attr("id", arcId)
                                        .attr("d", newArc)
                                        .style("fill", "none");

                                    svg.append("text")
                                        .append("textPath") //append a textPath to the text element
                                        .attr("xlink:href", "#" + arcId) //place the ID of the path here
                                        .style("text-anchor", "left") //place the text halfway on the arc
                                        .attr("startOffset", "50%")
                                        .attr("dy", -18)
                                        .attr("dx", -50) //Move the text from the start angle of the arc

                                        .text(() => { return radial[i]; });
                                }
                            }
                        }

                        bus.subscribe('filter', (a, e) => {
                            if (a === 'updated') updateRadar();
                        });

                        updateRadar();
                    }
                }



            }
        ])
}



