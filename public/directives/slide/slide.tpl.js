var slide;
(function (slide) {
    slide.html = '<div class="slide">    <h1 class="center">{{vm.title}}</h1>    <h2 class="center">{{vm.subTitle}}</h2>    <ul >      <li data-ng-repeat="c in vm.technology.content">        <h2>content</h2>      </li>    </ul>    <p>        {{vm.text}}    </p>    <div class="col-md-12">        <img data-ng-if="vm.media" class="img-responsive" data-ng-src="{{vm.media}}" alt="{{vm.title}}" />    </div></div>';
})(slide || (slide = {}));
