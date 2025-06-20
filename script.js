const name2 =document.getElementById('name');
const para2 =document.getElementById('para');
const btn2  =document.getElementById('btn');
const list2 =document.getElementById('list');

btn2.addEventListener('click', () =>
    {
    const name = name2.value.trim();
    const para = para2.value.trim();

    if(name && para)
    {
        const div =document.createElement('div');
        div.classList.add('item');

        const name1 = document.createElement('h1');
        name1.textContent=name;

        const para1 =document.createElement('p');
        para1.textContent=para;

        const img  = document.createElement('img');
        img.src = 'https://via.placeholder.com/150';
        img.alt='user photo';
        img.classList.add('user_pic');
        img.style.width = '150px';
        img.style.height ='150px';

        const update_pic = document.createElement('button');
        update_pic.textContent = 'update_ pic';
        update_pic.classList.add('update');


        const rmbtn = document.createElement('button');
        rmbtn.textContent = 'remove';
        rmbtn.classList.add('rbtn');

        update_pic.addEventListener('click',() =>
        {
            const url = prompt('Enter the Pic URL');
            if(url)
            {
                img.src=url;
            }
        })

        rmbtn.addEventListener('click' ,() =>
        {
            list2.removeChild(div);
        })

        div.appendChild(name1);
        div.appendChild(para1);
        div.appendChild(rmbtn);
        div.appendChild(update_pic);
        div.appendChild(img);


        list2.appendChild(div);

        name2.value ='';
        para2.value='';
    }
    else
    {
        alert("Please enter the Both name and ParaGraph...")
    }
});