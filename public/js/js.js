$(document).ready(function () {
  const $carousel = $(".owl-carousel");
  const apartmentsCount = $carousel.find(".item").length;

  if (apartmentsCount >= 5) {
    $carousel.owlCarousel({
      loop: true,
      margin: 0,
      responsive: {
        0: {
          items: 1
        },
        600: {
          items: 2
        },
        1000: {
          items: 4
        }
      }
    });

    $(".carousel-prev").click(() => $carousel.trigger("prev.owl.carousel"));
    $(".carousel-next").click(() => $carousel.trigger("next.owl.carousel"));
  } else {
    // Не запускаем карусель — используем флекс-центрирование
    $carousel.addClass("simple-center-carousel");
    $(".carousel-prev, .carousel-next").hide();
  }
});



  

  document.addEventListener("DOMContentLoaded", function () {
    const blocks = document.querySelectorAll(".reliability-block, .mortgage-calculator-block");

    function checkBlocksVisibility() {
        const windowHeight = window.innerHeight;

        blocks.forEach((block) => {
            const blockRect = block.getBoundingClientRect();
            const blockHeight = blockRect.height;
            const blockVisiblePoint = blockRect.top + blockHeight * 0.8;

            if (blockVisiblePoint < windowHeight) {
                block.style.opacity = "1";
                block.style.transform = "translateY(0)";
            }
        });
    }

    window.addEventListener("scroll", checkBlocksVisibility);
    checkBlocksVisibility(); 


    const aboutBoxes = document.querySelectorAll(".about-box");

    function checkAboutBoxesVisibility() {
        const windowHeight = window.innerHeight;

        aboutBoxes.forEach((box, index) => {
            const boxRect = box.getBoundingClientRect();
            const boxVisiblePoint = boxRect.top + boxRect.height * 0.5;

            if (boxVisiblePoint < windowHeight) {
                setTimeout(() => {
                    box.classList.add("visible");
                }, index * 250); 
            }
        });
    }

    window.addEventListener("scroll", checkAboutBoxesVisibility);
    checkAboutBoxesVisibility(); 
});


