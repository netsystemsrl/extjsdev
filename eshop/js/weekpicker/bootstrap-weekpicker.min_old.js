!function(t){t.fn.weekpicker=function(){var e,n,i=moment();function r(t){return t.data("DateTimePicker").date()}function a(t,i){var r=i.week(),a=i.year(),s=i.month();e=r,11==s&&1==r&&(a+=1),n=a,t.val("Week "+r+", "+a)}function s(e,n){var i=t("<div class='mb-0 p-2' style='cursor: pointer;'></div>");return"next"==e?(i.addClass("next-"+n.attr("id")),i.addClass("fa fa-chevron-right"),i.insertAfter(n)):"previous"==e?(i.addClass("previous-"+n.attr("id")),i.addClass("fa fa-chevron-left"),i.insertBefore(n)):void 0}function o(t,e,n){return e.click(function(){if("next"==t)var e=r(n).add(7,"days");else if("previous"==t)e=r(n).subtract(7,"days");var i;i=e,n.data("DateTimePicker").date(i)})}return this.getWeek=function(){return e},this.getYear=function(){return n},this.each(function(){t(this).append("<input type='text' class='form-control text-center'>");var e=t(this),n=e.find("input");n.datetimepicker({calendarWeeks:!0,format:"DD.MM.YYYY",defaultDate:i}).on("dp.change",function(e){var n=r(t(this));a(t(this),n)}).on("dp.show",function(){var e=r(t(this));a(t(this),e)}).on("dp.hide",function(){var e=r(t(this));a(t(this),e)}),a(n,i);var c=s("next",e),d=s("previous",e);o("next",c,n),o("previous",d,n)})}}(jQuery);