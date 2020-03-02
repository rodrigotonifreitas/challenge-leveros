export default class Card {
    constructor() {
        this.listCards = $('.cards')
        this.btnMoreCards = $('#moreCards')
        this.listagem()
        this.moreCards()
    }

    listagem (urlCards = `https://rickandmortyapi.com/api/character/`){

        let _this = this

        $.ajax({
            url: `${urlCards}`,
            beforeSend:  () => _this.btnMoreCards.text('Carregando...')
        }).done(function(res){
            _this.btnMoreCards.attr('data-url', res.info.next)

            res.results.map((card, i) => {
               _this.listCards.append(`
                    <li class="cards__card">
                        <figure>
                            <img src="${card.image}" alt="${card.name}">
                        </figure>
                        <h2 class="cards__card--name"> ${card.name} </h2>
                        <p class="cards__card--species"> <span> Species: </span> <strong>${card.species}</strong> </p>
                        <p class="cards__card--status"> <span> Status: </span> <strong>${card.status}</strong> </p>
                        <p class="cards__card--gender"> <span> Gender: </span> <strong>${card.gender}</strong> </p>
                    </li>
                `)
                _this.btnMoreCards.text('Ver mais')
            })
        })
        .fail(function(err) {
            console.log('err');
          })
    }

    moreCards (){
        let _this = this
        this.btnMoreCards.on('click', function(){
            let urlPage = $(this).attr('data-url')
            if(urlPage.length > 3){
                _this.listagem(urlPage)
            } else {
                $(this).text('Não há mais personagens =(')
            }
        })
    }

} 
